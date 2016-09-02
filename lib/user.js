'use strict';

const _clone = require('clone');

const RESERVED_KEYWORDS = ['_username', 'username', 'roles', '_roles', 'hasRole'];

/**
 * Represents a user that is making a request to a lambda function. Exposes
 * methods and properties for security checks, etc.
 */
class User {
    /**
     * @param {Object|String} user A simple object that defines the key properties
     *        for the user - username, roles and any other properties that
     *        may be attributed to the user. This argument may also be specified as
     *        a string, in which case it will be treated as the username property.
     * @param {Array} roles An array of roles associated with the user
     * @param {Object} [props={}] An optional set of additional properties 
     */
    constructor(user, roles, props) {
        if (typeof user === 'string') {
            if (!(roles instanceof Array)) {
                throw new Error('Invalid roles specified (arg #2)');
            }
            if (!props || (props instanceof Array) || typeof props !== 'object') {
                props = {};
            }
            const username = user;
            user = _clone(props);
            user.username = username;
            user.roles = roles;

        } else if (!user || (user instanceof Array) ||
            typeof user !== 'object') {
            throw new Error('Invalid user data specified (arg #1). Must be a string or object.');
        }
        if (typeof user.username !== 'string' || user.username.length <= 0) {
            throw new Error('User data does not define a valid username (user.username)');
        }
        if (!(user.roles instanceof Array)) {
            throw new Error('User data does not define valid roles (user.roles)');
        }

        for (let prop in user) {
            if (RESERVED_KEYWORDS.indexOf(prop) < 0) {
                this[prop] = user[prop];
            }
        }

        this._username = user.username;
        this._roles = _clone(user.roles);
    }

    /**
     * Returns the username of the current user.
     *
     * @return {String} The username of the current user object.
     */
    get username() {
        return this._username;
    }

    /**
     * Returns the roles held by the current user.
     *
     * @return {String} The roles held by the current user.
     */
    get roles() {
        return this._roles;
    }

    /**
     * Checks if the current user belongs to at least one of the specified
     * roles.
     *
     * @param {Array|String} roles An array of allowed roles for the user.
     *        This value can also be specified as a string, representing
     *        the single role that the user must belong to.
     *
     * @return {Boolean} True if the user belongs to one of the specified
     *         roles, false otherwise.
     */
    hasRole(roles) {
        if (typeof roles === 'string') {
            roles = [roles];
        }

        if (roles instanceof Array) {
            for (let index = 0; index < roles.length; index++) {
                if (this._roles.indexOf(roles[index]) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }
}

module.exports = User;
