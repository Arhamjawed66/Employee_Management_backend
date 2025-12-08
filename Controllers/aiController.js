
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';
import Groq from 'groq-sdk';

// @desc      Get job recommendations
// @route     POST /api/v1/ai/job-recommendations
// @access    Private
const getJobRecommendations = asyncHandler(async (req, res, next) => {
    const { skills, jobRole, resume } = req.body;

    if(!skills || !jobRole || !resume){
        return next(new ErrorResponse('Please provide skills, job role, and resume', 400));
    }

    // Check if Groq API key is set
    if (!process.env.GROQ_API_KEY) {
        console.error('Groq API key not found');
        return next(new ErrorResponse('AI service unavailable', 503));
    }

    // Initialize Groq client
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    try {
        const prompt = `Based on the following details, recommend job roles:
        Skills: ${skills}
        Experience Level: ${jobRole}
        Resume Summary: ${resume}

        Provide 2-3 job recommendations in JSON format with fields: title, company, location, description, matchPercentage.`;

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1,
            max_tokens: 8192,
            top_p: 1,
            reasoning_effort: 'medium',
            stream: false,
            stop: null,
        });

        let responseText = completion.choices[0].message.content.trim();

        // Remove markdown code block if present
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }

        let recommendations;
        try {
            recommendations = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', responseText);
            return next(new ErrorResponse('Invalid response from AI service', 500));
        }

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return next(new ErrorResponse('Failed to generate recommendations', 500));
    }
});

// @desc      Get team performance suggestions
// @route     POST /api/v1/ai/performance-suggestions
// @access    Private/Manager
const getPerformanceSuggestions = asyncHandler(async (req, res, next) => {
    const { teamData } = req.body;

    if(!teamData){
        return next(new ErrorResponse('Please provide team data', 400));
    }

    // Mock response
    const mockSuggestions = [
        "Implement a peer-review system to foster collaboration.",
        "Organize weekly knowledge-sharing sessions.",
        "Set clearer goals and KPIs for each team member."
    ];

    res.status(200).json({
        success: true,
        data: mockSuggestions
    });
});

// @desc      Get best performing employee
// @route     GET /api/v1/ai/best-employee
// @access    Private/Admin
const getBestEmployee = asyncHandler(async (req, res, next) => {
    // Check if Groq API key is set
    if (!process.env.GROQ_API_KEY) {
        console.error('Groq API key not found');
        return next(new ErrorResponse('AI service unavailable', 503));
    }

    // Initialize Groq client
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    // Fetch all employees (assuming we have access to Employee model)
    const Employee = (await import('../Models/EmployeeModel.js')).default;
    const employees = await Employee.find({ role: 'Employee' }).select('firstName lastName department tasksCompleted attendanceRate performanceScore hireDate');

    if (!employees || employees.length === 0) {
        return next(new ErrorResponse('No employees found', 404));
    }

    // Prepare data for analysis
    const employeeData = employees.map(emp => ({
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        tasksCompleted: emp.tasksCompleted || 0,
        attendanceRate: emp.attendanceRate || 0,
        performanceScore: emp.performanceScore || 0,
        hireDate: emp.hireDate
    }));

    const prompt = `Analyze the following employee performance data and determine the best performing employee. Consider factors like tasks completed, attendance rate, performance score, and tenure.

Employee Data:
${JSON.stringify(employeeData, null, 2)}

Provide a JSON response with the best employee's name, department, and a brief reason why they are the best performer. Format: {"bestEmployee": {"name": "string", "department": "string", "reason": "string"}}`;

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const responseText = completion.choices[0].message.content.trim();

        let analysis;
        try {
            analysis = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', responseText);
            return next(new ErrorResponse('Invalid response from AI service', 500));
        }

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Groq API error:', error);
        return next(new ErrorResponse('Failed to analyze employee performance', 500));
    }
});

// @desc      Chat with AI for admin problem solving
// @route     POST /api/v1/ai/chat
// @access    Private/Admin
const chatWithAdmin = asyncHandler(async (req, res, next) => {
    const { message } = req.body;

    if (!message) {
        return next(new ErrorResponse('Please provide a message', 400));
    }

    // Check if Groq API key is set
    if (!process.env.GROQ_API_KEY) {
        console.error('Groq API key not found');
        return next(new ErrorResponse('AI service unavailable', 503));
    }

    // Initialize Groq client
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `You are a helpful AI assistant for an employment management system. Respond to the following query in a concise and helpful manner.

User Query: ${message}`;

    try {
        // Set headers for Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            reasoning_effort: 'medium',
            stream: true,
            stop: null,
        });

        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Groq API error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to get chatbot response' })}\n\n`);
        res.end();
    }
});

export {
    getJobRecommendations,
    getPerformanceSuggestions,
    getBestEmployee,
    chatWithAdmin,
};
