// tslint:disable:no-namespace

declare namespace OpenApiDiff {
    type ValidationResultSource = 'json-schema-diff' | 'openapi-diff';

    export type ValidationResultEntity =
        'oad.basePath' |
        'oad.host' |
        'oad.info.title' |
        'oad.info.description' |
        'oad.info.termsOfService' |
        'oad.info.version' |
        'oad.info.contact.name' |
        'oad.info.contact.email' |
        'oad.info.contact.url' |
        'oad.info.license.name' |
        'oad.info.license.url' |
        'oad.schemes' |
        'oad.path' |
        'oad.parameter.body' |
        'oad.parameter.path' |
        'oad.parameter.query' |
        'oad.parameter.header' |
        'oad.parameter.form' |
        'oad.response' |
        'oad.response.description' |
        'oad.response.header' |
        'oad.unclassified' |
        'oad.openapi';

    export type ValidationResultAction =
        'add' |
        'delete' |
        'edit' |
        'item.add' |
        'item.delete';

    export type ValidationResultType =
        'breaking' |
        'unclassified' |
        'non-breaking';

    export interface ValidationResult {
        entity: ValidationResultEntity;
        message?: string;
        sourceSpecEntityDetails: ValidationResultSpecEntityDetails;
        destinationSpecEntityDetails: ValidationResultSpecEntityDetails;
        source: ValidationResultSource;
        action: ValidationResultAction;
        type: ValidationResultType;
        details?: any;
    }

    export interface ValidationResultSpecEntityDetails {
        location?: string;
        pathMethod: string | null;
        pathName: string | null;
        value?: any;
    }

    export type SpecFormat = 'swagger2' | 'openapi3';

    export interface SpecDetails {
        location: string;
        format: SpecFormat;
    }

    export interface ValidationOutcome {
        breakingDifferences: ValidationResult[];
        destinationSpecDetails: SpecDetails;
        failureReason?: string;
        nonBreakingDifferences: ValidationResult[];
        sourceSpecDetails: SpecDetails;
        success: boolean;
        unclassifiedDifferences: ValidationResult[];
    }

    export interface SpecOption {
        content: any;
        location: string;
    }

    export interface OpenApiDiffOptions {
        sourceSpec: SpecOption;
        destinationSpec: SpecOption;
    }
}

declare interface OpenApiDiffStatic {
    validate: (options: OpenApiDiff.OpenApiDiffOptions) => Promise<OpenApiDiff.ValidationOutcome>;
}

declare const OpenApiDiff: OpenApiDiffStatic;
export = OpenApiDiff;