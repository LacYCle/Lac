/**
 * 使用B站API搜索相关课程视频
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回结果数量限制
 * @returns {Promise<Array>} - 搜索结果
 */


async function searchBilibiliCourses(keyword, page = 1, order = 'click') {
    const axios = require('axios');
    const url = 'https://api.bilibili.com/x/web-interface/search/type';
    
    // 设置请求参数
    const params = {
        page,
        order,
        keyword,
        search_type: 'video'
    };
    
    // 设置请求头
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://search.bilibili.com',
        'Cookie': 'buvid3=2B4E9BEA-92E9-8A34-C666-64C21E06B57F14793infoc'
    };
    
    try {
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get(url, {
            params,
            headers
        });
        
        // 提取所需字段并重新组织数据
        const filteredResults = [];
        if (response.data.data && response.data.data.result) {
            for (const item of response.data.data.result) {
                let pic = item.pic || '';
                if (pic.startsWith('//')) {
                    pic = 'https:' + pic;
                } else if (pic && !pic.startsWith('http')) {
                    pic = 'https://' + pic;
                }
                const filteredItem = {
                    video_url: item.arcurl || '',
                    title: item.title || '',
                    uploader: item.author || '',
                    description: item.description || '',
                    tag: item.tag || '',
                    pic: pic,
                    play: item.play || '',
                    review: item.review || '',
                    favorites: item.favorites || ''
                };
                filteredResults.push(filteredItem);
            }
        }
        
        return filteredResults;
        
    } catch (error) {
        console.error('请求错误:', error.message);
        return null;
    }
}

module.exports = {
    searchBilibiliCourses
};

// 测试搜索
//(async () => {
    //const result = await searchBilibiliCourses('数据结构');
//})();