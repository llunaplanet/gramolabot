process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const Repository = require('../src/lib/repository');
const aws = require('aws-sdk');
const async = require('async');
const uuid = require('uuid/v4');

// docker run -p 8000:8000 -d --name dynamodb peopleperhour/dynamodb

aws.config.update({
    region: "any_region",
    endpoint: "http://localhost:8000"
});

before(function(done) {
    repository = new Repository(aws, 'anyTableName', 'primaryKey');
    // clean old test tables
    repository.deleteTable(function(err) {
        done();
    });
})

describe('Repository Query', function() {

    before(function(done) {

        repository = new Repository(aws, 'anyTableName', 'primaryKey', 'sortKey');

        async.series([
            function(callback) {
                repository.createTable(callback);
            },
            function(callback) {
                var doc = {
                    primaryKey: "somePrimaryKeyA",
                    sortKey: uuid(),
                    stringA: "valueA",
                    numberB: 10
                };
                repository.addOrReplace(doc,callback);
            },
            function(callback) {
                var doc = {
                    primaryKey: "somePrimaryKeyA",
                    sortKey: uuid(),
                    stringA: "valueB",
                    numberB: 20
                };
                repository.addOrReplace(doc,callback);
            },
            function(callback) {
                var doc = {
                    primaryKey: "somePrimaryKeyA",
                    stringA: "valueC",
                    sortKey: uuid(),
                    numberB: 30
                };
                repository.addOrReplace(doc,callback);
            },
            function(callback) {
                var doc = {
                    primaryKey: "somePrimaryKeyB",
                    stringA: "valueC",
                    sortKey: uuid(),
                    numberB: 30
                };
                repository.addOrReplace(doc,callback);
            }

        ],done);
    });

    after(function(done) {
        repository.deleteTable(done);
    });

    it('should find 3 docs', function(done) {
        repository.query(
            {partitionKey: "somePrimaryKeyA"},
            function(err, docs) {
                expect(err).to.be.null;
                expect(docs).to.have.lengthOf(3);
                done();
            }
        );
    });

    it('should find 1 doc', function(done) {
        repository.query(
            {
                partitionKey: "somePrimaryKeyA",
                filter: {
                    key: "stringA",
                    value: "valueA",
                    condition: "="
                }
            },
            function(err, docs) {
                expect(err).to.be.null;
                expect(docs).to.have.lengthOf(1);
                done();
            }
        );
    });

    it('should find 2 docs', function(done) {
        repository.query(
            {
                partitionKey: "somePrimaryKeyA",
                filter: {
                    key: "numberB",
                    value: 10,
                    condition: ">"
                }
            },
            function(err, docs) {
                expect(err).to.be.null;
                expect(docs).to.have.lengthOf(2);
                done();
            }
        );
    });

    it('should find 0 docs', function(done) {
        repository.query(
            {partitionKey: "somePrimaryKeyX"},
            function(err, docs) {
                expect(err).to.be.null;
                expect(docs).to.have.lengthOf(0);
                done();
            }
        );
    });
});


describe('Repository with primaryKey', function(){

    before(function() {
        repository = new Repository(aws, 'anyTableName', 'primaryKey');
    })

    it('should create a new table', function(done) {
        repository.createTable(function(err) {
            expect(err).to.be.null;
            done();
        });
    });

    context('having an item with primaryKey = somePrimaryKey', function(){

        it('should create a new item with', function(done) {

            var doc = {
                primaryKey: "somePrimaryKey",
                stringA: "valueA",
                numberB: 130
            };

            repository.addOrReplace(doc,function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should find a new item', function(done) {

            repository.findBy("somePrimaryKey", function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.deep.equal({
                    primaryKey: "somePrimaryKey",
                    stringA: "valueA",
                    numberB: 130
                });
                done();
            });
        });

        it('should update the item with', function(done) {

            var doc = {
                primaryKey: "somePrimaryKey",
                stringA: "valueB",
                numberB: 200,
                stringB: "valueC"
            };

            repository.addOrReplace(doc, function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should find the updated item', function(done) {

            repository.findBy("somePrimaryKey",function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.deep.equal({
                    primaryKey: "somePrimaryKey",
                    stringA: "valueB",
                    numberB: 200,
                    stringB: "valueC"
                });
                done();
            });
        });

        it('should delete the item', function(done) {

            repository.removeBy("somePrimaryKey",function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should fail to find the deleted item with', function(done) {

            repository.findBy("somePrimaryKey", function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.be.null;
                done();
            });
        });

        it('should delete the [anyTableName] table', function(done) {
            repository.deleteTable(function(err) {
                expect(err).to.be.null;
                done();
            });
        });
    });

});

describe('Repository with primaryKey and sortKey', function(){

    before(function() {
        repository = new Repository(aws, 'anyTableName', 'primaryKey', 'sortKey');
    })

    it('should create a new table', function(done) {
        repository.createTable(function(err) {
            expect(err).to.be.null;
            done();
        });
    });

    context('having an item with primaryKey = somePrimaryKey:someSortKey', function(){

        it('should create a new repository item', function(done) {

            var doc = {
                primaryKey: "somePrimaryKey",
                sortKey: "someSortKey",
                stringA: "valueA",
                numberB: 130
            };

            repository.addOrReplace(doc, function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should find the new item', function(done) {

            repository.findBy("somePrimaryKey", "someSortKey", function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.deep.equal({
                    primaryKey: "somePrimaryKey",
                    sortKey: "someSortKey",
                    stringA: "valueA",
                    numberB: 130
                });
                done();
            });
        });

        it('should update the item', function(done) {

            var doc = {
                primaryKey: "somePrimaryKey",
                sortKey: "otherSortKey",
                stringA: "valueB",
                numberB: 200,
                stringB: "valueC"
            };

            repository.addOrReplace(doc, function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should find the updated item', function(done) {

            repository.findBy("somePrimaryKey", "otherSortKey", function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.deep.equal({
                    primaryKey: "somePrimaryKey",
                    sortKey: "otherSortKey",
                    stringA: "valueB",
                    numberB: 200,
                    stringB: "valueC"
                });
                done();
            });
        });

        it('should delete the item with', function(done) {

            repository.removeBy("somePrimaryKey", "otherSortKey", function(err) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should fail to find the deleted item', function(done) {

            repository.findBy("somePrimaryKey", "otherSortKey", function(err, doc) {
                expect(err).to.be.null;
                expect(doc).to.be.null;
                done();
            });
        });

        it('should delete the [anyTableName] table', function(done) {
            repository.deleteTable(function(err) {
                expect(err).to.be.null;
                done();
            });
        });
    });
});
