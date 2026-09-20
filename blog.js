const postFiles = ['0.mk','1.mk','2.mk'];


async function load() {
    const container = document.getElementById('blog-list');
    container.innerHTML = '';
    for (const File of postFiles) {
        const response = await fetch('posts/' + File);
        console.log(response);
        const rawText = await response.text();
        
        const {data, main} = parseFrontmatter(rawText); 
        
        const htmlBody = marked.parse(main);
        
        const postDiv = document.createElement('div');
        postDiv.innerHTML = 
        `
        <div class='frontmatter'>
        <h2>${data.title}</h2>
        <p><em>${data.date}</em></p>
        </div>
        <div class='blog_main'>
        ${htmlBody}
        </div>
        <hr>
        `;
        container.appendChild(postDiv);


        // Wait for images to load
        const images = [...container.querySelectorAll('img')];
        await Promise.all(images.map(image => {
          if (image.complete) return Promise.resolve();
          return new Promise(resolve => {
            image.addEventListener('load', resolve, {once: true});
            image.addEventListener('error', resolve, {once: true});
          });
      }));
      // scroll to the bottom
      container.scrollTop = container.scrollHeight;
    }
}
    function parseFrontmatter(raw) {
    console.log(raw)
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!match) return { data: {}, main: raw };

      const frontmatterText = match[1];
      console.log(frontmatterText)
      const main = match[2];
      
      const data = {};
      frontmatterText.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        data[key.trim()] = rest.join(':').trim();
        
      });
      
      return {data, main};
    }

    load();