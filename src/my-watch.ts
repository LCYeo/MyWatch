/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class MyWatch {

    @Property()
    public AuthDealer  : string;
    public Brand : string;
    public model : string;
    public Sno : string;
    public Owner : string;
    public status : string;
}
