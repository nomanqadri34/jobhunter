import geminiService from './services/geminiService.js';

async function testGemini() {
    console.log('Testing Gemini AI service...\n');

    try {
        console.log('1. Testing Career Roadmap Generation...');
        const roadmap = await geminiService.generateCareerRoadmap(
            'Full Stack Developer',
            ['JavaScript', 'HTML', 'CSS'],
            'beginner'
        );
        console.log('✅ Career Roadmap generated successfully');
        console.log('Preview:', roadmap.substring(0, 200) + '...\n');
    } catch (error) {
        console.log('❌ Career Roadmap failed:', error.message, '\n');
    }

    try {
        console.log('2. Testing Interview Prep Generation...');
        const interviewPrep = await geminiService.generateInterviewPrep(
            'Software Engineer',
            'Google',
            'We are looking for a software engineer to join our team...'
        );
        console.log('✅ Interview Prep generated successfully');
        console.log('Preview:', interviewPrep.substring(0, 200) + '...\n');
    } catch (error) {
        console.log('❌ Interview Prep failed:', error.message, '\n');
    }

    try {
        console.log('3. Testing Skill Gap Analysis...');
        const skillGap = await geminiService.generateSkillGapAnalysis(
            'Data Scientist',
            ['Python', 'Excel'],
            'Beginner with some programming experience'
        );
        console.log('✅ Skill Gap Analysis generated successfully');
        console.log('Preview:', skillGap.substring(0, 200) + '...\n');
    } catch (error) {
        console.log('❌ Skill Gap Analysis failed:', error.message, '\n');
    }

    console.log('Gemini AI testing completed!');
}

testGemini();