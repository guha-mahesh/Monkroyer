import { Router, Request, Response } from 'express';


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
router.post('/score', scorePrompt);

export default router;