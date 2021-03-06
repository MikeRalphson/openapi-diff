import {
    DiffResultAction,
    DiffResultCode,
    DiffResultEntity,
    DiffResultSource,
    DiffResultSpecEntityDetails
} from '../../../api-types';
import {ParsedProperty} from '../../spec-parser-types';
import {Difference} from './difference';

interface CreateDifferenceOptions {
    sourceSpecOrigins: ParsedProperty[];
    destinationSpecOrigins: ParsedProperty[];
    propertyName: string;
    action: DiffResultAction;
    details?: any;
    source: DiffResultSource;
}

const findEntityForDiff = (propertyName: string): DiffResultEntity => {
    return propertyName.includes('xProperties')
        ? 'unclassified'
        : `${propertyName}` as DiffResultEntity;
};

const createSpecEntityDetails = (parsedProperty: ParsedProperty): DiffResultSpecEntityDetails => (
    {
        location: parsedProperty.originalPath.join('.'),
        value: parsedProperty.value
    }
);

export const createDifference = (options: CreateDifferenceOptions): Difference => {
    const entity = findEntityForDiff(options.propertyName);
    const difference: Difference = {
        action: options.action,
        code: `${entity}.${options.action}` as DiffResultCode,
        destinationSpecEntityDetails: options.destinationSpecOrigins.map(createSpecEntityDetails),
        entity,
        source: options.source,
        sourceSpecEntityDetails: options.sourceSpecOrigins.map(createSpecEntityDetails)
    };

    if (options.details) {
        difference.details = options.details;
    }

    return difference;
};
