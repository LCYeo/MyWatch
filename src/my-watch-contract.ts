/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MyWatch } from './my-watch';

@Info({title: 'MyWatchContract', description: 'My Smart Contract' })
export class MyWatchContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async myWatchExists(ctx: Context, myWatchId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(myWatchId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async RegisterMyWatch(ctx: Context, myWatchId: string, AuthDealer: string, Brand: string, model:string, Sno: string, Owner: string, status: string ): Promise<void> {
        const exists: boolean = await this.myWatchExists(ctx, myWatchId)
        if (exists) {
            throw new Error(`The my watch ${myWatchId} already exists`);
        }
        const myWatch: MyWatch = new MyWatch();
        myWatch.AuthDealer = AuthDealer;
        myWatch.Brand = Brand;
        myWatch.model = model;
        myWatch.Sno = Sno;
        myWatch.Owner = Owner;
        myWatch.status = status;
        const buffer: Buffer = Buffer.from(JSON.stringify(myWatch));
        await ctx.stub.putState(myWatchId, buffer);
    }

    @Transaction(false)
    @Returns('MyWatch')
    public async readMyWatch(ctx: Context, myWatchId: string): Promise<MyWatch> {
        const exists: boolean = await this.myWatchExists(ctx, myWatchId);
        if (!exists) {
            throw new Error(`The my watch ${myWatchId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(myWatchId);
        const myWatch: MyWatch = JSON.parse(data.toString()) as MyWatch;
        return myWatch;
    }

    @Transaction()
    public async updateMyWatchOwner(ctx: Context, myWatchId: string, newOwner: string): Promise<void> {
        const exists: boolean = await this.myWatchExists(ctx, myWatchId);
        if (!exists) {
            throw new Error(`The my watch ${myWatchId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(myWatchId);
        const myWatch: MyWatch = JSON.parse(data.toString()) as MyWatch;
        myWatch.Owner = newOwner;
        const buffer: Buffer = Buffer.from(JSON.stringify(myWatch));
        await ctx.stub.putState(myWatchId, buffer);
    }

    @Transaction()
    public async updateMyWatchStatus(ctx: Context, myWatchId: string, newstatus: string): Promise<void> {
        const exists: boolean = await this.myWatchExists(ctx, myWatchId);
        if (!exists) {
            throw new Error(`The my watch ${myWatchId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(myWatchId);
        const myWatch: MyWatch = JSON.parse(data.toString()) as MyWatch;
        myWatch.status = newstatus;
        const buffer: Buffer = Buffer.from(JSON.stringify(myWatch));
        await ctx.stub.putState(myWatchId, buffer);
    }

    @Transaction(false)
    public async ReadAllWatch(ctx: Context): Promise<string> {
        const startKey = 'W000';
        const endKey = 'W999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());
    
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
    @Transaction(false)
    public async ReadAllMyWatch(ctx: Context, Owner: string): Promise<string> {
        const startKey = 'W000';
        const endKey = 'W999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());
    
                const Key = res.value.key;
                const data: Uint8Array = await ctx.stub.getState(Key);
                const myWatch: MyWatch = JSON.parse(data.toString()) as MyWatch;
                if (myWatch.Owner == Owner) {
                    let Record;
                    try {
                        Record = JSON.parse(res.value.value.toString());
                    } catch (err) {
                        console.log(err);
                        Record = res.value.value.toString();
                    }
                    allResults.push({ Key, Record });
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction()
    public async deleteMyWatch(ctx: Context, myWatchId: string): Promise<void> {
        const exists: boolean = await this.myWatchExists(ctx, myWatchId);
        if (!exists) {
            throw new Error(`The my watch ${myWatchId} does not exist`);
        }
        await ctx.stub.deleteState(myWatchId);
    }

}
