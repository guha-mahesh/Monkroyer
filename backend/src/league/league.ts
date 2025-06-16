import { Router, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import { pool } from '../server';
import jwt from 'jsonwebtoken';
import verifyToken, { AuthRequest } from '../middleware/auth';

const router = Router();

const generateCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

async function createLeague(req: AuthRequest, res: Response) {
    const { leagueName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Received:', { leagueName, userId });

    const code = generateCode()
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO league (leagueName, createdBy, code) VALUES (?, ?, ?)',
            [leagueName, userId, code]
        )
        if (result) {
            const leagueId = result.insertId;

            await pool.execute(
                'INSERT INTO league_members (users_id, league_id) VALUES (?, ?)',
                [userId, leagueId]
            );

            console.log("League created and creator added as member");

            console.log("Success")
            res.json({
                success: true,
                code: code,
                id: leagueId
            });
        }

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to create League',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function joinLeague(req: AuthRequest, res: Response) {
    const { code } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Received:', { code, userId });

    try {
        const [leagueResult] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM league WHERE code = (?)',
            [code]
        )
        if (leagueResult.length > 0) {
            const leagueId = leagueResult[0].league_id;
            const [result] = await pool.execute<ResultSetHeader>(
                'INSERT INTO league_members (users_id, league_id) VALUES (?, ?)',
                [userId, leagueId]
            )

            if (result) {
                console.log('Success, club joined')
                res.json({
                    success: true,
                    league_id: leagueId
                });
            }
        } else {
            res.status(400).json({
                error: 'Invalid Code',
            })
        }

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to Join League',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function getUserByID(id: string) {
    const [member] = await pool.execute<RowDataPacket[]>(
        'SELECT username FROM users WHERE users_id = (?)',
        [id]
    );
    if (member) {
        console.log("Found Member")
        return member[0].username;
    }
}

async function getLeague(req: AuthRequest, res: Response) {
    const { leagueID } = req.params;
    console.log('Received:', { leagueID });
    const [league] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM league WHERE league_id = (?)',
        [leagueID]
    );
    const [members] = await pool.execute<RowDataPacket[]>(
        'SELECT users_id FROM league_members WHERE league_id = (?)',
        [leagueID]
    );
    if (league && members) {
        console.log("League Found")
        console.log(`Found ${members.length} members in league ${leagueID}`);
        const usersList: any[] = [];
        for (const member of members) {
            const userName = await getUserByID(member.users_id);
            usersList.push(userName);
        }
        res.json({
            success: true,
            leagueName: league[0].leagueName,
            members: usersList
        });
    }
}

router.post('/league', verifyToken, createLeague);
router.post('/member', verifyToken, joinLeague);
router.get('/league/:leagueID', verifyToken, getLeague);

export default router;