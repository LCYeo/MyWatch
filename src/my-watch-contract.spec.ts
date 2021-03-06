/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { MyWatchContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('MyWatchContract', () => {

    let contract: MyWatchContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new MyWatchContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"my watch 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"my watch 1002 value"}'));
    });

    describe('#myWatchExists', () => {

        it('should return true for a my watch', async () => {
            await contract.myWatchExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a my watch that does not exist', async () => {
            await contract.myWatchExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMyWatch', () => {

        it('should create a my watch', async () => {
            await contract.createMyWatch(ctx, '1003', 'my watch 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"my watch 1003 value"}'));
        });

        it('should throw an error for a my watch that already exists', async () => {
            await contract.createMyWatch(ctx, '1001', 'myvalue').should.be.rejectedWith(/The my watch 1001 already exists/);
        });

    });

    describe('#readMyWatch', () => {

        it('should return a my watch', async () => {
            await contract.readMyWatch(ctx, '1001').should.eventually.deep.equal({ value: 'my watch 1001 value' });
        });

        it('should throw an error for a my watch that does not exist', async () => {
            await contract.readMyWatch(ctx, '1003').should.be.rejectedWith(/The my watch 1003 does not exist/);
        });

    });

    describe('#updateMyWatch', () => {

        it('should update a my watch', async () => {
            await contract.updateMyWatch(ctx, '1001', 'my watch 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"my watch 1001 new value"}'));
        });

        it('should throw an error for a my watch that does not exist', async () => {
            await contract.updateMyWatch(ctx, '1003', 'my watch 1003 new value').should.be.rejectedWith(/The my watch 1003 does not exist/);
        });

    });

    describe('#deleteMyWatch', () => {

        it('should delete a my watch', async () => {
            await contract.deleteMyWatch(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a my watch that does not exist', async () => {
            await contract.deleteMyWatch(ctx, '1003').should.be.rejectedWith(/The my watch 1003 does not exist/);
        });

    });

});
