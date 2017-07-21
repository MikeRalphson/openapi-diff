import specDiffer from '../../../lib/openapi-diff/spec-differ';

import {
    Diff,
    OpenAPI3Spec,
    ParsedSpec
} from '../../../lib/openapi-diff/types';

const buildOpenApiSpecWithFullInfoObject = (): OpenAPI3Spec => {
    const spec = {
        info: {
            contact: {
                email: 'contact email',
                name: 'contact name',
                url: 'contact url'
            },
            description: 'spec description',
            licence: {
                name: 'licence name',
                url: 'licence url'
            },
            termsOfService: 'terms of service',
            title: 'spec title',
            version: 'version'
        },
        openapi: '3.0.0'
    };
    return spec;
};

const buildParsedSpecWithFullInfoObject = (): ParsedSpec => {
    const spec = {
        info: {
            contact: {
                email: 'contact email',
                name: 'contact name',
                url: 'contact url'
            },
            description: 'spec description',
            licence: {
                name: 'licence name',
                url: 'licence url'
            },
            termsOfService: 'terms of service',
            title: 'spec title',
            version: 'version'
        },
        openapi: '3.0.0'
    };
    return spec;
};

describe('specDiffer', () => {

    describe('when there is a single change in the info object', () => {

        it('should classify a single change in the info object as non-breaking', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.breakingChanges.length).toEqual(0);
            expect(result.unclassifiedChanges.length).toEqual(0);
            expect(result.nonBreakingChanges.length).toBe(1);
            expect(result.nonBreakingChanges[0].type).toEqual('non-breaking');
        });

        it('should populate the taxonomy of a single change in the info object as an edition in it', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.nonBreakingChanges[0].taxonomy).toEqual('info.object.edit');
        });

        it('should populate the paths of a single change in the info object correctly', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.nonBreakingChanges[0].path[0]).toEqual('info');
            expect(result.nonBreakingChanges[0].path[1]).toEqual('title');
            expect(result.nonBreakingChanges[0].printablePath[0]).toEqual('info');
            expect(result.nonBreakingChanges[0].printablePath[1]).toEqual('title');
        });

        it('should copy the rest of the individual diff attributes across', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.nonBreakingChanges[0].lhs).toEqual('spec title');
            expect(result.nonBreakingChanges[0].rhs).toEqual('NEW spec title');
            expect(result.nonBreakingChanges[0].index).toBeNull();
            expect(result.nonBreakingChanges[0].item).toBeNull();
        });
    });

    describe('when there are multiple changes in the info object', () => {

        it('should classify multiple changes in the info object as non-breaking', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            if (newParsedSpec.info.contact) {
                newParsedSpec.info.contact.name = 'NEW contact name';
            } else {
                fail('Unexpected mock spec attributes missing');
            }

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.breakingChanges.length).toEqual(0);
            expect(result.unclassifiedChanges.length).toEqual(0);
            expect(result.nonBreakingChanges.length).toEqual(2);
            expect(result.nonBreakingChanges[0].type).toEqual('non-breaking');
            expect(result.nonBreakingChanges[1].type).toEqual('non-breaking');
        });

        it('should populate the taxonomy of multiple changes in the info object as an edition to it', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            if (newParsedSpec.info.contact) {
                newParsedSpec.info.contact.name = 'NEW contact name';
            } else {
                fail('Unexpected mock spec attributes missing');
            }

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);
            expect(result.nonBreakingChanges[0].taxonomy).toEqual('info.object.edit');
            expect(result.nonBreakingChanges[1].taxonomy).toEqual('info.object.edit');
        });

        it('should populate the paths of the multiple changes in the info object correctly', () => {
            const oldSpec = buildOpenApiSpecWithFullInfoObject();
            const oldParsedSpec = buildParsedSpecWithFullInfoObject();
            const newParsedSpec = buildParsedSpecWithFullInfoObject();
            newParsedSpec.info.title = 'NEW spec title';

            if (newParsedSpec.info.contact) {
                newParsedSpec.info.contact.name = 'NEW contact name';
            } else {
                fail('Unexpected mock spec attributes missing');
            }

            const result: Diff = specDiffer.diff(oldSpec, oldParsedSpec, newParsedSpec);

            expect(result.nonBreakingChanges[0].path[0]).toEqual('info');
            expect(result.nonBreakingChanges[0].path[1]).toEqual('contact');
            expect(result.nonBreakingChanges[0].path[2]).toEqual('name');
            expect(result.nonBreakingChanges[0].printablePath[0]).toEqual('info');
            expect(result.nonBreakingChanges[0].printablePath[1]).toEqual('contact');
            expect(result.nonBreakingChanges[0].printablePath[2]).toEqual('name');

            expect(result.nonBreakingChanges[1].path[0]).toEqual('info');
            expect(result.nonBreakingChanges[1].path[1]).toEqual('title');
            expect(result.nonBreakingChanges[1].printablePath[0]).toEqual('info');
            expect(result.nonBreakingChanges[1].printablePath[1]).toEqual('title');
        });
    });
});
