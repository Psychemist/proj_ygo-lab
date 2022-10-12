import { Client } from "pg"
import dotenv from 'dotenv';

//assume the location of your .env is in the rubbishfolder
dotenv.config();

export const client = new Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
})

client.connect()