import * as assert from 'assert';
import * as _ from 'lodash';
import {Swagger2, Swagger2Paths} from '../../../lib/openapi-diff/swagger2';
import {Swagger2PathItemBuilder} from './swagger2-path-item-builder';

interface Paths {
    [pathName: string]: Swagger2PathItemBuilder;
}

interface Swagger2SpecBuilderState {
    paths: Paths;
    xProperties: {[key: string]: any};
}

export class Swagger2SpecBuilder {
    public static defaultSwagger2SpecBuilder(): Swagger2SpecBuilder {
        return new Swagger2SpecBuilder({
            paths: {},
            xProperties: {}
        });
    }

    private constructor(private readonly state: Swagger2SpecBuilderState) {}

    public build(): Swagger2 {
        const paths = Object.keys(this.state.paths).reduce<Swagger2Paths>((swagger2Paths, currentPath) => {
            swagger2Paths[currentPath] = this.state.paths[currentPath].build();
            return swagger2Paths;
        }, {});
        const copyOfXProperties = _.cloneDeep(this.state.xProperties);

        return {
            info: {
                title: '',
                version: ''
            },
            paths,
            swagger: '2.0',
            ...copyOfXProperties
        };
    }

    public withTopLevelXProperty(name: string, value: any): Swagger2SpecBuilder {
        assert.ok(name.indexOf('x-') === 0, `Expected name '${name}' to start with x-`);
        const copyOfXproperties = {...this.state.xProperties};
        copyOfXproperties[name] = _.cloneDeep(value);
        return new Swagger2SpecBuilder({...this.state, xProperties: copyOfXproperties});
    }

    public withPath(pathName: string, pathItemBuilder: Swagger2PathItemBuilder): Swagger2SpecBuilder {
        const copyOfPaths = {...this.state.paths};
        copyOfPaths[pathName] = pathItemBuilder;
        return new Swagger2SpecBuilder({...this.state, paths: copyOfPaths});
    }

    public withNoPaths(): Swagger2SpecBuilder {
        return new Swagger2SpecBuilder({...this.state, paths: {}});
    }
}

export const swagger2SpecBuilder = Swagger2SpecBuilder.defaultSwagger2SpecBuilder();
