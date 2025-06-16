import { Router, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import { pool } from '../server';
import jwt from 'jsonwebtoken';


const router = Router();


const generateCode = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

async function createLeague(req: Request, res: Response) {
    const { leagueName, createdBy } = req.body;


    console.log('Received:', { leagueName, createdBy });

    const code = generateCode()
    try {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO league (leagueName, createdBy, code) VALUES (?, ?, ?)',
            [leagueName, createdBy, code]
        )
        if (result) {
            const leagueId = result.insertId;




            const userId = createdBy.id;

            await pool.execute(
                'INSERT INTO league_members (users_id, league_id) VALUES (?, ?)',
                [userId, leagueId]
            );

            console.log("League created and creator added as member");


            console.log("Success")
        }
        res.json({
            success: true,
            code: code
        });


    } catch (error) {

        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to create League',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }


}
async function joinLeague(req: Request, res: Response) {
    const { code, user } = req.body;

    console.log('Received:', { code, user });

    try {
        const [leagueResult] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM league WHERE code = (?)',
            [code]
        )
        if (leagueResult) {
            const userResult = user.id
            if (userResult) {
                console.log(userResult)
                const leagueId = leagueResult[0].league_id;
                const [result] = await pool.execute<ResultSetHeader>(
                    'INSERT INTO league_members (users_id, league_id) VALUES (?, ?)',
                    [userResult, leagueId]
                )

                if (result) {
                    console.log('Success, club joined')
                    res.json({
                        success: true,
                        league_id: leagueId
                    });

                }

            }

        }
        else {
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


async function getLeague(req: Request, res: Response) {
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


router.post('/league', createLeague);
router.post('/member', joinLeague);
router.get('/league/:leagueID', getLeague)

export default router;