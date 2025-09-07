import rapidApiService from './services/rapidApiService.js';

async function testAPIs() {
    console.log('Testing RapidAPI services...\n');

    try {
        // Test JSearch API
        console.log('1. Testing JSearch API...');
        const jsearchResults = await rapidApiService.searchJobs('software developer jobs in chicago', 1, 1);
        console.log('✅ JSearch API working - Found', jsearchResults?.data?.length || 0, 'jobs\n');
    } catch (error) {
        console.log('❌ JSearch API failed:', error.message, '\n');
    }

    try {
        // Test ATS Jobs API
        console.log('2. Testing ATS Jobs API...');
        const atsResults = await rapidApiService.getActiveATSExpiredJobs();
        console.log('✅ ATS Jobs API working - Response received\n');
    } catch (error) {
        console.log('❌ ATS Jobs API failed:', error.message, '\n');
    }

    try {
        // Test Internships API
        console.log('3. Testing Internships API...');
        const internshipResults = await rapidApiService.getActiveInternships();
        console.log('✅ Internships API working - Response received\n');
    } catch (error) {
        console.log('❌ Internships API failed:', error.message, '\n');
    }

    try {
        // Test Interview Details API
        console.log('4. Testing Interview Details API...');
        const interviewResults = await rapidApiService.getInterviewDetails('19018219');
        console.log('✅ Interview Details API working - Response received\n');
    } catch (error) {
        console.log('❌ Interview Details API failed:', error.message, '\n');
    }

    try {
        // Test Resume Parser API
        console.log('5. Testing Resume Parser API...');
        const sampleResume = `John Doe
Software Engineer
Experience: 3 years in JavaScript, React, Node.js
Education: BS Computer Science`;

        const parseResults = await rapidApiService.parseResume(sampleResume);
        console.log('✅ Resume Parser API working - Response received\n');
    } catch (error) {
        console.log('❌ Resume Parser API failed:', error.message, '\n');
    }

    try {
        // Test Combined Search
        console.log('6. Testing Combined Search...');
        const combinedResults = await rapidApiService.searchAllJobs('developer', 'chicago');
        console.log('✅ Combined Search working - Multiple APIs called\n');
    } catch (error) {
        console.log('❌ Combined Search failed:', error.message, '\n');
    }

    console.log('API testing completed!');
}

testAPIs();