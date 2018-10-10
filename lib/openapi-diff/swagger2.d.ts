// tslint:disable:no-implicit-dependencies
import {BodyParameter, Header, Operation, Parameter, Path, Response, Schema, Spec} from 'swagger-schema-official';

export type Swagger2 = Spec;
export type Swagger2Parameter = Parameter;
export type Swagger2BodyParameter = BodyParameter;
export type Swagger2PathItem = Path;
export type Swagger2Operation = Operation;
export type Swagger2Response = Response;
export type Swagger2ResponseHeader = Header;
export type Swagger2Schema = Schema;

export type Swagger2MethodNames = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch';

export interface Swagger2Paths {
    [pathName: string]: Swagger2PathItem;
}

export interface Swagger2Responses {
    [responseName: string]: Swagger2Response;
}
