/* jshint node:true, expr:true */
'use strict';

const _sinon = require('sinon');
const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _testHelper = require('wysknd-test');
const _testValueProvider = _testHelper.testValueProvider;
const User = require('../../lib/user');

describe('User', () => {
    const DEFAULT_USERNAME = '__default_username__';
    const DEFAULT_ROLES = ['admin', 'user'];

    describe('ctor()', () => {
        it('should throw an error if invoked without a valid user data object', () => {
            const error = 'Invalid user data specified (arg #1). Must be a string or object.';
            _testValueProvider.allButSelected('string', 'object').forEach((user) => {
                const wrapper = () => {
                    return new User(user);
                };
                expect(wrapper).to.throw(error);
            });
        });

        describe('[user data as object]', () => {

            it('should throw an error if the user object does not include a valid username property', () => {
                const error = 'User data does not define a valid username (user.username)';
                _testValueProvider.allButString('').forEach((username) => {
                    const wrapper = () => {
                        return new User({
                            username: username
                        });
                    };
                    expect(wrapper).to.throw(error);
                });
            });

            it('should throw an error if the user object does not include a valid roles property', () => {
                const error = 'User data does not define valid roles (user.roles)';
                _testValueProvider.allButArray().forEach((roles) => {
                    const wrapper = () => {
                        return new User({
                            username: DEFAULT_USERNAME,
                            roles: roles
                        });
                    };
                    expect(wrapper).to.throw(error);
                });
            });

            it('should return a user object configured with the specified username and roles', () => {
                const userData = {
                    username: 'foobar',
                    roles: ['admin', 'user']
                };

                const user = new User(userData);

                expect(user.hasRole).to.be.a('function');
                expect(user.username).to.equal(userData.username);
                expect(user.roles).to.deep.equal(userData.roles);
            });

            it('should apply additional properties from the arguments to the object instance', () => {
                const userData = {
                    username: DEFAULT_USERNAME,
                    roles: DEFAULT_ROLES,
                    foo: 'bar',
                    abc: 123,
                    another: 'property'
                };

                const user = new User(userData);
                delete userData.username;
                delete userData.roles;

                for (let prop in userData) {
                    expect(user[prop]).to.equal(userData[prop]);
                }
            });

            it('should ignore properites that use reserved keywords as names', () => {
                const userData = {};
                const value = 'should not assign';
                const reservedWords = ['_username', 'username', 'roles', '_roles', 'hasRole'];
                reservedWords.forEach((word) => userData[word] = value);

                userData.username = DEFAULT_USERNAME;
                userData.roles = DEFAULT_ROLES;

                const user = new User(userData);

                reservedWords.forEach((word) => {
                    expect(user[word]).to.not.equal(value);
                });
            });
        });

        describe('[username, roles and props as individual args]', () => {
            it('should throw an error if invoked without valid roles if the username is a string', () => {
                const error = 'Invalid roles specified (arg #2)';
                _testValueProvider.allButArray().forEach((roles) => {
                    const wrapper = () => {
                        return new User(DEFAULT_USERNAME, roles);
                    };
                    expect(wrapper).to.throw(error);
                });
            });

            it('should return a user object configured with the specified username and roles', () => {
                const username = 'foobar';
                const roles = ['admin', 'user'];

                const user = new User(username, roles);

                expect(user.hasRole).to.be.a('function');
                expect(user.username).to.equal(username);
                expect(user.roles).to.deep.equal(roles);
            });

            it('should apply additional properties from the arguments to the object instance', () => {
                const props = {
                    foo: 'bar',
                    abc: 123,
                    another: 'property'
                };

                const user = new User(DEFAULT_USERNAME, DEFAULT_ROLES, props);

                for (let prop in props) {
                    expect(user[prop]).to.equal(props[prop]);
                }
            });

            it('should ignore properites that use reserved keywords as names', () => {
                const props = {};
                const value = 'should not assign';
                const reservedWords = ['_username', 'username', 'roles', '_roles', 'hasRole'];
                reservedWords.forEach((word) => props[word] = value);

                const user = new User(DEFAULT_USERNAME, DEFAULT_ROLES);

                reservedWords.forEach((word) => {
                    expect(user[word]).to.not.equal(value);
                });
            });
        });
    });

    describe('hasRole', () => {
        it('should return false if not invoked with a valid array or string', () => {
            _testValueProvider.allButSelected('string', 'array').forEach((roles) => {
                const user = new User(DEFAULT_USERNAME, DEFAULT_ROLES);
                expect(user.hasRole(roles)).to.be.false;
            });
        });

        it('should return false if the user does not have any of the specified roles', () => {
            const roles = ['bad', 'role', 'foo', DEFAULT_USERNAME];
            const user = new User(DEFAULT_USERNAME, []);

            expect(user.hasRole(roles)).to.be.false;

            // Repeat the test with each role being passed as a string.
            roles.forEach((role) => {
                expect(user.hasRole(role)).to.be.false;
            });
        });

        it('should return true if the user does have at least one of the specified roles', () => {
            const roles = ['user', 'admin', 'superadmin', 'manager'];
            const user = new User(DEFAULT_USERNAME, roles);

            expect(user.hasRole(roles)).to.be.true;

            // Repeat the test with each role being passed as a string.
            roles.forEach((role) => {
                expect(user.hasRole(role)).to.be.true;
            });
        });
    });
});
