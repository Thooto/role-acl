import { CommonUtil } from './../utils/';
// dep modules
// own modules
import { IQueryInfo } from '../core';

/**
 *  Represents the inner `Permission` class that defines the granted or denied
 *  access permissions for the target resource and role.
 *
 *  You can check for a permission in two ways:
 *
 *  <ul>
 *  <li>
 *  You can first obtain a {@link ?api=ac#AccessControl~Query|`Query` instance}
 *  via {@link ?api=ac#AccessControl#can|`AccessControl#can`} which returns
 *  a `Permission` instance when an action method such as
 *  {@link ?api=ac#AccessControl~Query#createAny|`.createAny()`} is
 *  called.
 *  <p><pre><code> var permission = ac.can('user').createAny('video');
 *  console.log(permission.granted); // boolean</code></pre></p>
 *  </li>
 *  <li>
 *  Or you can call {@link ?api=ac#AccessControl#permission|`AccessControl#permission`}
 *  by passing a fulfilled {@link ?api=ac#AccessControl#IQueryInfo|`IQueryInfo` object}.
 *  <p><pre><code> var permission = ac.permission({
 *      role: 'user',
 *      resource: 'video',
 *      action: 'create'
 *  });
 *  console.log(permission.granted); // boolean</code></pre></p>
 *  </li>
 *  </ul>
 *
 *  @class
 *  @inner
 *  @memberof AccessControl
 */
class Permission {

    /**
     *  @private
     */
    private _: any = {};

    /**
     *  Initializes a new `Permission` instance.
     *  @private
     *
     *  @param {IQueryInfo} query
     *         An `IQueryInfo` arbitrary object.
     */
    constructor(query: IQueryInfo, attributes: any) {
        this._.role = query.role;
        this._.resource = query.resource;
        this._.context = query.context;
        this._.attributes = attributes;
    }

    /**
     *  Specifies the roles for which the permission is queried for.
     *  Even if the permission is queried for a single role, this will still
     *  return an array.
     *
     *  If the returned array has multiple roles, this does not necessarily mean
     *  that the queried permission is granted or denied for each and all roles.
     *  Note that when a permission is queried for multiple roles, attributes
     *  are union (merged) for all given roles. This means "at least one of
     *  these roles" have the permission for this action and resource attribute.
     *
     *  @name AccessControl~Permission#roles
     *  @type {Array<String>}
     *  @readonly
     */
    get roles(): string[] {
        return this._.role;
    }

    /**
     *  Specifies the target resource for which the permission is queried for.
     *
     *  @name AccessControl~Permission#resource
     *  @type {String}
     *  @readonly
     */
    get resource(): string {
        return this._.resource;
    }

    /**
     *  Gets an array of allowed attributes which are defined via
     *  Glob notation. If access is not granted, this will be an empty array.
     *
     *  Note that when a permission is queried for multiple roles, attributes
     *  are union (merged) for all given roles. This means "at least one of
     *  these roles" have the permission for this action and resource attribute.
     *
     *  @name AccessControl~Permission#attributes
     *  @type {Array<string>}
     *  @readonly
     */
    get attributes(): string[] {
        return this._.attributes;
    }

    /**
     *  Specifies whether the permission is granted. If `true`, this means at
     *  least one attribute of the target resource is allowed.
     *
     *  @name AccessControl~Permission#granted
     *  @type {Boolean}
     *  @readonly
     */
    get granted() {
        if (!this.attributes || this.attributes.length === 0) {
            return false;
        }
        return this.attributes.some((attr: string) => {
            return attr.trim().slice(0, 1) !== '!';
        });
    }

    /**
     *  Filters the given data object (or array of objects) by the permission
     *  attributes and returns this data with allowed attributes.
     *
     *  @param {Object|Array} data
     *         Data object to be filtered. Either a single object or array
     *         of objects.
     *
     *  @returns {Object|Array}
     *           The filtered data object.
     */
    filter(data: any, options?: { query: boolean }) {
        if (options && options.query === true) {
            return this.filterQuery(data);
        }

        return CommonUtil.filterAll(data, this.attributes);
    }
    
    filterQuery(query: any) {
        const attributes = CommonUtil.filterAll(
            this.buildAttributes(query),
            this.attributes
        );

        this.injectAttributes(query, attributes);

        return query;
    }

    buildAttributes(query: any, attributes: any = {}) {
        if (query.attributes) {
            query.attributes.forEach(
                (attribute: string) => (attributes[attribute] = null)
            );
        }
    
        if (query.include) {
            query.include.forEach((include: any) => {
                attributes[include.model] = {};
    
                this.buildAttributes(include, attributes[include.model]);
            });
        }
    
        return attributes;
    }

    injectAttributes(query: any, attributes: any) {
        query.attributes = Object.keys(attributes).filter(
            key => attributes[key] === null
        );

        if (query.include) {
            query.include.forEach((include: any) =>
                this.injectAttributes(include, attributes[include.model])
            );
        }
    }

}

export { Permission };
