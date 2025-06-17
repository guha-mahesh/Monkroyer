import { Router, Request, Response } from 'express';
import { pool } from '../server';
import { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import verifyToken from '../middleware/auth';


const router = Router();

interface OllamaResponse {
    response: string;
}

async function scorePrompt(req: Request, res: Response) {
    try {
        const { prompt } = req.body;
        await fetch('http://host.docker.internal:11434/api/reset', { method: 'POST' });
        const response = await fetch("http://host.docker.internal:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt: `Please rate the likelihood of the following event on a scale from 1 to 100, 
where 1 means impossible and 100 means certain.

Only respond with a number between 1 and 100, including decimals if necessary, 
with up to one decimal place, and no explanations.\n${prompt}\nScore:`,
                stream: false
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Upstream API error:", text);
            return res.status(502).json({ error: "Upstream API error" });
        }

        const data = await response.json() as OllamaResponse;
        console.log("Unlikelihood Score:", data.response.trim());
        res.json({ score: data.response.trim() });
    } catch (error) {
        console.error("Error in scorePrompt:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


async function saveBingo(req: Request, res: Response) {
    const { prompt, userId, score } = req.body;
    console.log("received:", { prompt, userId, score })
    const [result] = await pool.execute<RowDataPacket[]>(
        'SELECT count FROM bingoItems WHERE users_id = (?)',
        [userId]
    )
    let count = 0;
    if (result.length > 0) {
        count = result[0].count;
    }
    try {
        if (count < 5) {
            await pool.execute('INSERT INTO bingoItems (content, users_id, score) VALUES (?, ?, ?)', [prompt, userId, score]

            )
            await pool.execute(
                'UPDATE bingoItems SET count = count + 1 WHERE users_id = ?',
                [userId]
            );
            res.json({
                success: true,
            });


        }
        else {
            res.json({
                success: false,
                error: "Delete a Bingo Item!, too many items!"
            })
        }
    }
    catch (err) {
        console.error('Error in saveBingo:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching league data.'
        });
    }


}

async function updateHappenstance(req: Request, res: Response) {
    const { promptId, score } = req.body;
    console.log("received:", { promptId })
    try {
        const [result] = await pool.execute<ResultSetHeader[]>(
            'UPDATE bingoItems SET happened = TRUE WHERE id = (?);',
            [promptId]
        )
        const [user] = await pool.execute<RowDataPacket[]>(
            'SELECT users_id FROM bingoItems WHERE id = (?);',
            [promptId]
        )
        const userId = user[0].users_id;


        const [result2] = await pool.execute<ResultSetHeader[]>(
            'UPDATE users SET points = points + (?) WHERE users_id = (?);',
            [score, userId]
        )
        const [newData] = await pool.execute<RowDataPacket[]>(
            'SELECT happened FROM bingoItems WHERE id = (?);',
            [promptId]
        )
        const [newData2] = await pool.execute<RowDataPacket[]>(
            'SELECT points FROM users WHERE users_id = (?);',
            [userId]
        )
        console.log(newData2[0].points)
        res.json({
            success: true,
            happen: Boolean(newData[0].happened),
            points: Boolean(newData2[0].points)


        })
    }
    catch (err) {
        console.error('Error in updateHappenstance:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating item data.'
        });

    }



}





router.post('/score', scorePrompt);
router.post('/bingoItem', verifyToken, saveBingo);
router.patch('/happenstance', verifyToken, updateHappenstance);

export default router;