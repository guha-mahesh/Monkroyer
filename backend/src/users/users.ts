// routes/users.ts
import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import { pool } from '../server';
import { hashPassword, verifyPassword } from './hash'
import jwt from 'jsonwebtoken';



const router = Router();



async function createUser(req: Request, res: Response) {
    const { username, password } = req.body;


    console.log('Received:', { username, password });

    const pwd = await hashPassword(password);

    try {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, pwd]
        );

        if (result) {
            const token = jwt.sign(
                {
                    userId: result.insertId,
                    username: username
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token: token,
                user: {
                    id: result.insertId,
                    username: username
                }

            });
        }
    } catch (error) {

        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}


async function getUserData(username: string) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        ) as [RowDataPacket[], any];

        if (rows.length === 0) {
            return null;
        }

        return rows[0];

    } catch (error) {
        console.error("Couldn't find User :", error);
        return null;
    }
}




async function Login(req: Request, res: Response) {
    const { username, password } = req.body;
    console.log('Received:', { username, password });
    const user_data = await getUserData(username)
    if (user_data) {
        const hashed_pwd = user_data.password
        try {
            const verification = await verifyPassword(password, hashed_pwd)
            if (verification) {
                const token = jwt.sign(
                    {
                        userId: user_data.id,
                        username: user_data.username
                    },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '24h' }
                );
                res.json({
                    success: true,
                    token: token,
                    user: {
                        id: user_data.id,
                        username: user_data.username

                    }
                });
            }
            else {
                res.json({ match: "incorrect password" })
            }
        }
        catch {
            console.error("could not verify password")


        }
    }


}


router.post('/users', createUser);
router.post('/login', Login)
//router.get('/users/:id', getUser);  
//router.put('/users/:id', updateUser);
//router.delete('/users/:id', deleteUser);

export default router;