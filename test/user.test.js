import {vi, expect, describe} from 'vitest';
const {connectToMongoDb} = require('src/app');


describe('userRepo', () => {

    beforeEach(connectToMongoDb);
    it('Skal oprette en bruger', async () => {
        
    });


    it('Læse alle brugere', async () => {


    });
})
