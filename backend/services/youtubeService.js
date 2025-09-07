import axios from 'axios';

class YouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
    }

    async searchVideos(query, maxResults = 10) {
        try {
            if (!this.apiKey) {
                console.warn('YouTube API key not configured, using fallback');
                return this.getFallbackVideos(query);
            }

            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: maxResults,
                    key: this.apiKey,
                    order: 'relevance',
                    videoDuration: 'medium', // 4-20 minutes
                    videoDefinition: 'high'
                }
            });

            return response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));
        } catch (error) {
            console.error('YouTube API error:', error);
            return this.getFallbackVideos(query);
        }
    }

    async getInterviewVideos(jobTitle, skills = []) {
        const queries = [
            `${jobTitle} interview questions`,
            `${jobTitle} interview tips`,
            `${jobTitle} technical interview`,
            ...skills.map(skill => `${skill} interview questions`)
        ];

        const allVideos = [];

        for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
            const videos = await this.searchVideos(query, 3);
            allVideos.push(...videos);
        }

        // Remove duplicates and return top 9 videos
        const uniqueVideos = allVideos.filter((video, index, self) =>
            index === self.findIndex(v => v.id === video.id)
        );

        return uniqueVideos.slice(0, 9);
    }

    getFallbackVideos(query) {
        const fallbackVideos = [
            {
                id: 'fallback1',
                title: `${query} - Complete Guide`,
                description: `Comprehensive guide covering ${query} with expert insights and practical tips.`,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'Career Success',
                publishedAt: new Date().toISOString(),
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
            },
            {
                id: 'fallback2',
                title: `Master ${query} - Expert Tips`,
                description: `Professional advice and strategies for ${query} success.`,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'Interview Pro',
                publishedAt: new Date().toISOString(),
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tips')}`
            },
            {
                id: 'fallback3',
                title: `${query} - Step by Step`,
                description: `Detailed walkthrough of ${query} with real examples and practice scenarios.`,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                channelTitle: 'Tech Career Hub',
                publishedAt: new Date().toISOString(),
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`
            }
        ];

        return fallbackVideos;
    }
}

export default new YouTubeService();