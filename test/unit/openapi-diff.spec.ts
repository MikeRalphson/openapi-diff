import {OpenApiDiffErrorImpl} from '../../lib/common/open-api-diff-error-impl';
import {diffOutcomeSuccessBuilder} from '../support/builders/diff-outcome-success-builder';
import {specDetailsBuilder} from '../support/builders/spec-details-builder';
import {swagger2SpecBuilder} from '../support/builders/swagger2-spec-builder';
import {swagger2SpecsDifferenceBuilder} from '../support/builders/swagger2-specs-difference-builder';
import {expectToFail} from '../support/expect-to-fail';
import {createOpenApiDiffWithMocks} from './support/create-openapi-diff';
import {createMockFileSystem, MockFileSystem} from './support/mocks/mock-file-system';
import {createMockHttpClient, MockHttpClient} from './support/mocks/mock-http-client';
import {createMockResultReporter, MockResultReporter} from './support/mocks/mock-result-reporter';

describe('openapi-diff', () => {
    let mockHttpClient: MockHttpClient;
    let mockFileSystem: MockFileSystem;
    let mockResultReporter: MockResultReporter;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockFileSystem = createMockFileSystem();
        mockResultReporter = createMockResultReporter();
    });

    const invokeDiffLocations = (sourceSpecPath: string, destinationSpecPath: string): Promise<void> => {
        const openApiDiff = createOpenApiDiffWithMocks({mockFileSystem, mockResultReporter, mockHttpClient});
        return openApiDiff.diffPaths(sourceSpecPath, destinationSpecPath);
    };

    describe('content loading', () => {
        it('should call the file system and http client handler with the provided location', async () => {
            await invokeDiffLocations('source-spec.json', 'http://input.url');

            expect(mockFileSystem.readFile).toHaveBeenCalledWith('source-spec.json');
            expect(mockHttpClient.get).toHaveBeenCalledWith('http://input.url');
        });

        it('should error out when the file system returns an error', async () => {
            mockFileSystem.givenReadFileFailsWith(new Error('test file system error'));

            await expectToFail(invokeDiffLocations('non-existing-file.json', 'destination-spec.json'));

            expect(mockResultReporter.reportError).toHaveBeenCalledWith(new OpenApiDiffErrorImpl(
                'OPENAPI_DIFF_FILE_SYSTEM_ERROR',
                'Unable to read non-existing-file.json',
                new Error('test file system error')
            ));
        });

        it('should error out when the http client returns an error', async () => {
            mockHttpClient.givenGetFailsWith(new Error('test http client error'));

            await expectToFail(invokeDiffLocations('http://url.that.errors.out', 'destination-spec.json'));

            expect(mockResultReporter.reportError).toHaveBeenCalledWith(new OpenApiDiffErrorImpl(
                'OPENAPI_DIFF_HTTP_CLIENT_ERROR',
                'Unable to load http://url.that.errors.out',
                new Error('test http client error')
            ));
        });

        it('should load the specs as yaml if content is yaml but not json', async () => {
            const swagger2YamlSpec = '' +
                'info: \n' +
                '  title: spec title\n' +
                '  version: spec version\n' +
                'paths: {}\n' +
                'swagger: "2.0"\n';
            mockFileSystem.givenReadFileReturns(
                Promise.resolve(swagger2YamlSpec),
                Promise.resolve(swagger2YamlSpec)
            );

            await invokeDiffLocations('source-spec.json', 'destination-spec.json');
        });
    });

    it('should load the source spec from the file system', async () => {
        await invokeDiffLocations('source-spec.json', 'destination-spec.json');

        expect(mockFileSystem.readFile).toHaveBeenCalledWith('source-spec.json');
    });

    it('should load the destination spec from the file system', async () => {
        await invokeDiffLocations('source-spec.json', 'destination-spec.json');

        expect(mockFileSystem.readFile).toHaveBeenCalledWith('destination-spec.json');
    });

    it('should report an error when failing to load the source spec from the file system', async () => {
        const swaggerSpecContent = JSON.stringify(swagger2SpecBuilder.build());
        const fileSystemError = new Error('Failed to load file');
        mockFileSystem.givenReadFileReturns(
            Promise.reject(fileSystemError),
            Promise.resolve(swaggerSpecContent)
        );

        await expectToFail(invokeDiffLocations('source-spec.json', 'destination-spec.json'));

        expect(mockResultReporter.reportError).toHaveBeenCalledWith(
            new OpenApiDiffErrorImpl(
                'OPENAPI_DIFF_FILE_SYSTEM_ERROR',
                'Unable to read source-spec.json',
                fileSystemError
            )
        );
    });

    it('should report an error when failing to load the destination spec from the file system', async () => {
        const swaggerSpecContent = JSON.stringify(swagger2SpecBuilder.build());
        const fileSystemError = new Error('Failed to load file');
        mockFileSystem.givenReadFileReturns(
            Promise.resolve(swaggerSpecContent),
            Promise.reject(fileSystemError)
        );

        await expectToFail(invokeDiffLocations('source-spec.json', 'destination-spec.json'));

        expect(mockResultReporter.reportError).toHaveBeenCalledWith(
            new OpenApiDiffErrorImpl(
                'OPENAPI_DIFF_FILE_SYSTEM_ERROR',
                'Unable to read destination-spec.json',
                fileSystemError
            )
        );
    });

    it('should report an error when unable to parse spec contents', async () => {
        const malformedFileContents: string = '{this is not json or yaml';
        mockFileSystem.givenReadFileReturnsContent(malformedFileContents);

        await expectToFail(invokeDiffLocations('source-spec-invalid.json', 'destination-spec.json'));

        expect(mockResultReporter.reportError).toHaveBeenCalledWith(
            new OpenApiDiffErrorImpl(
                'OPENAPI_DIFF_SPEC_DESERIALISER_ERROR',
                'Unable to parse source-spec-invalid.json as a JSON or YAML file'
            )
        );
    });

    it('should report the diff outcome when diffing is successfully executed', async () => {
        const swaggerSpecContent = JSON.stringify(swagger2SpecBuilder.build());
        mockFileSystem.givenReadFileReturns(
            Promise.resolve(swaggerSpecContent),
            Promise.resolve(swaggerSpecContent)
        );
        await invokeDiffLocations('source-spec.json', 'destination-spec.json');

        expect(mockResultReporter.reportOutcome).toHaveBeenCalledWith(
            diffOutcomeSuccessBuilder
                .withNonBreakingDifferences([])
                .withUnclassifiedDifferences([])
                .withSourceSpecDetails(
                    specDetailsBuilder.withFormat('swagger2').withLocation('source-spec.json'))
                .withDestinationSpecDetails(
                    specDetailsBuilder.withFormat('swagger2').withLocation('destination-spec.json'))
                .build()
        );
    });

    it('should return a rejected promise when breaking differences have been found', async () => {
        const {source, destination} = swagger2SpecsDifferenceBuilder
            .withBreakingDifference()
            .build();

        const sourceSpecContent = JSON.stringify(source.build());
        const destinationSpecContent = JSON.stringify(destination.build());

        mockFileSystem.givenReadFileReturns(
            Promise.resolve(sourceSpecContent),
            Promise.resolve(destinationSpecContent)
        );

        const error = await expectToFail(invokeDiffLocations('source-spec.json', 'destination-spec.json'));
        expect(error.message).toEqual('Breaking differences found');
    });
});
