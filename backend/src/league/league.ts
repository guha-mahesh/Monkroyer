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

const findClubsJoined = async (userId: string) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT clubsJoined FROM users WHERE users_id = (?)', [userId]
    )
    const clubsJoined = rows[0].clubsJoined
    return clubsJoined;

}

const checkCreator = async (userId: string, leagueId: string) => {
    let creator = false;
    console.log("check Creator league", leagueId)
    const [result] = await pool.execute<RowDataPacket[]>('SELECT createdBy FROM league WHERE league_id = (?)', [leagueId]);
    if (result) {

        console.log(userId)
        if (result && result.length > 0 && result[0]) {
            creator = result[0].createdBy == userId;
        }

    }
    return creator;

}






async function createLeague(req: AuthRequest, res: Response) {
    const { leagueName } = req.body;
    const userId = req.user?.userId;


    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const clubsJoined = await findClubsJoined(userId);

    console.log('Received:', { leagueName, userId });

    const code = generateCode()
    if (clubsJoined < 3) {
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
                await pool.execute(
                    'UPDATE users SET clubsJoined = clubsJoined + 1 WHERE users_id = ?',
                    [userId]
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
    else {
        res.status(401).json({
            error: 'Too many Clubs. Please Delete one',

        });

    }
}


async function joinLeague(req: AuthRequest, res: Response) {
    const { code } = req.body;
    const userId = req.user?.userId;


    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const clubsJoined = await findClubsJoined(userId);

    console.log('Received:', { code, userId });
    if (clubsJoined < 3) {
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
                await pool.execute(
                    'UPDATE users SET clubsJoined = clubsJoined + 1 WHERE users_id = ?',
                    [userId]
                );

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
    else {
        res.status(401).json({
            error: 'Too many Clubs. Please Delete one',

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

    const { leagueID, userID } = req.params;
    console.log('Received:', { leagueID, userID });
    console.log("getLeagueLeague", leagueID)
    const created = await checkCreator(userID, leagueID)


    const [YourBingoItems] = await pool.execute<RowDataPacket[]>('SELECT score, content, id FROM bingoItems WHERE users_id = (?)', [userID]
    )

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
            members: usersList,
            created: created,
            leagueCode: league[0].code,
            BingoItems: YourBingoItems,


        });
    }
}

async function getAllLeagues(req: AuthRequest, res: Response) {
    const { usersId } = req.params;

    console.log('Received:', usersId)
    const [leagues] = await pool.execute<RowDataPacket[]>(
        'SELECT league_id FROM league_members WHERE users_id = (?)', [usersId]
    )
    const leagueIds = leagues.map(row => row.league_id);
    if (leagueIds.length > 0) {
        const placeholders = leagueIds.map(() => '?').join(',');
        const [leagueInfo] = await pool.execute<RowDataPacket[]>(
            `SELECT league_id, leagueName, createdBy FROM league WHERE league_id IN (${placeholders})`,
            leagueIds
        );
        if (leagueInfo.length >= 0) {
            res.json({
                success: true,
                league: leagueInfo,


            });

        }
        else {
            res.json({
                success: false,
                error: "Not in any leagues!",

            })
        }
    }
    else {
        res.json({
            success: false,
            error: "Couldn't fetch league info",

        })
    }





}

router.post('/league', verifyToken, createLeague);
router.post('/member', verifyToken, joinLeague);
router.get('/league/:leagueID/:userID', verifyToken, getLeague);
router.get('/myLeagues/:usersId', verifyToken, getAllLeagues);

export default router;