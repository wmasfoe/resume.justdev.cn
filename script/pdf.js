const fs = require('fs-extra')
const path = require('path')
const puppeteer = require('puppeteer')
const { spawn } = require('child_process')

// 确保PDF目录存在并删除已存在的PDF
const ensurePdfDir = () => {
  const dir = path.join(process.cwd(), 'public', 'pdfs');
  fs.ensureDirSync(dir);
  
  // 删除已存在的PDF文件
  const pdfPath = path.join(dir, 'resume.pdf');
  if (fs.existsSync(pdfPath)) {
    console.log(`删除已存在的PDF文件: ${pdfPath}`);
    fs.unlinkSync(pdfPath);
  }
  
  // 删除已存在的HTML文件
  const htmlPath = path.join(dir, 'resume.html');
  if (fs.existsSync(htmlPath)) {
    console.log(`删除已存在的HTML文件: ${htmlPath}`);
    fs.unlinkSync(htmlPath);
  }
  
  return dir;
};

async function buildPDF() {
  let serverProcess = null;
  
  try {
    console.log('开始生成简历PDF和HTML...');
    
    // 启动一个临时的开发服务器以获取渲染后的HTML
    console.log('启动临时开发服务器...');
    
    // 仅使用spawn启动服务器
    serverProcess = spawn('npx', ['next', 'dev', '-p', '3001'], { 
      detached: true,
      stdio: 'pipe'
    });
    
    // 记录服务器输出
    serverProcess.stdout.on('data', (data) => {
      console.log(`服务器输出: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`服务器错误: ${data}`);
    });
    
    // 等待服务器启动
    console.log('等待服务器启动...');
    await new Promise(resolve => setTimeout(resolve, 15000)); // 增加等待时间到15秒
    
    // 使用Puppeteer访问页面并获取HTML
    console.log('使用Puppeteer访问页面...');
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // 设置视口大小，确保内容能够正确渲染
    await page.setViewport({
      width: 1200,
      height: 1800,
      deviceScaleFactor: 1,
    });
    
    // 访问本地服务器上的简历页面
    console.log('正在访问本地服务器...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // 在页面上执行脚本，保留原始样式但隐藏不需要的元素
    await page.evaluate(() => {
      // 隐藏聊天机器人等不需要在PDF中显示的元素
      const elementsToHide = document.querySelectorAll('.fixed, [role="dialog"]');
      elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      // 移除任何可能妨碍PDF生成的元素
      const elementsToRemove = document.querySelectorAll('iframe, canvas, video, audio');
      elementsToRemove.forEach(el => el.remove());
      
      // 添加打印样式，确保内容可以正确分页和显示
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Source Han Sans SC';
          src: local('Source Han Sans SC'), local('思源黑体'), local('Noto Sans CJK SC');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
            font-family: 'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif !important;
          }
          .resumeContainer {
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            font-family: 'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif !important;
          }
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            font-family: 'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // 强制应用字体到所有文本元素
      document.querySelectorAll('*').forEach(el => {
        if (el.innerText && el.innerText.trim() !== '') {
          el.style.fontFamily = "'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif";
        }
      });
    });
    
    // 等待字体加载和样式应用
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if(process.env.NODE_ENV === 'development') {
      // 获取页面内容的截图，用于调试
      await page.screenshot({
        path: path.join(process.cwd(), 'debug-screenshot.png'),
        fullPage: true
      });
      console.log('调试截图已保存到 debug-screenshot.png');
    }
    
    // 使用Puppeteer的内置功能获取所有样式表内容
    const fullHtml = await page.evaluate(async () => {
      // 获取所有样式表
      const styleSheets = Array.from(document.styleSheets);
      let allCss = '';
      
      // 尝试提取每个样式表的规则
      for (const sheet of styleSheets) {
        try {
          // 对于同域样式表，我们可以直接访问其规则
          if (sheet.cssRules) {
            const rules = Array.from(sheet.cssRules);
            allCss += rules.map(rule => rule.cssText).join('\n');
          }
        } catch (e) {
          console.log(`无法访问样式表规则: ${e.message}`);
        }
      }
      
      // 创建一个包含所有内联样式的新HTML
      const html = document.documentElement.outerHTML;
      
      // 创建新文档
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 移除所有外部样式表链接，保留内联样式
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
      
      // 添加所有提取到的CSS作为内联样式
      if (allCss) {
        const styleElement = doc.createElement('style');
        styleElement.textContent = allCss;
        doc.head.appendChild(styleElement);
      }
      
      // 添加调试提示
      const debugNote = doc.createElement('div');
      debugNote.style.padding = '10px';
      debugNote.style.margin = '10px 0';
      debugNote.style.backgroundColor = '#f0f0f0';
      debugNote.style.border = '1px solid #ddd';
      debugNote.innerHTML = '<h3>调试用HTML</h3><p>此文件是为了调试而生成的，包含了所有样式。</p>';
      doc.body.insertBefore(debugNote, doc.body.firstChild);
      
      return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    });
    
    // 获取页面高度以确保捕获所有内容
    const bodyHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });
    
    console.log(`页面总高度: ${bodyHeight}px`);
    
    // 打印PDF，使用适合的配置确保样式保留
    console.log('生成PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      displayHeaderFooter: false, 
      printBackground: true,
      margin: {
        top: '0.4in',
        bottom: '0.4in',
        left: '0.4in',
        right: '0.4in',
      },
    });
    
    // 关闭浏览器
    await browser.close();
    
    // 确保目录存在并保存PDF和HTML
    const pdfDir = ensurePdfDir();
    
    // 保存PDF
    const pdfPath = path.join(pdfDir, 'resume.pdf');
    fs.writeFileSync(pdfPath, pdf);
    console.log(`PDF已生成: ${pdfPath}`);
    
    // 保存HTML
    const htmlPath = path.join(pdfDir, 'resume.html');
    fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
    console.log(`HTML已生成: ${htmlPath}`);
    
    return { pdf, html: fullHtml };
  } catch (error) {
    console.error('生成PDF时出错:', error);
    throw error;
  } finally {
    // 确保在任何情况下都关闭服务器进程
    if (serverProcess) {
      console.log('关闭开发服务器...');
      // 在Windows上使用process.kill(pid)，在Linux/Mac上使用负pid杀死进程组
      if (process.platform === 'win32') {
        // Windows
        try {
          process.kill(serverProcess.pid);
        } catch (e) {
          console.log(`无法直接关闭服务器: ${e.message}`);
        }
      } else {
        // Linux/Mac
        try {
          process.kill(-serverProcess.pid);
        } catch (e) {
          console.log(`无法关闭服务器进程组: ${e.message}`);
        }
      }
      
      // 使用taskkill强制关闭（Windows）或pkill（Linux/Mac）
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
        } else {
          spawn('pkill', ['-P', serverProcess.pid]);
        }
      } catch (e) {
        console.log(`尝试强制关闭失败: ${e.message}`);
      }
    }
  }
}

// 直接调用函数
buildPDF().then(() => {
  console.log('PDF和HTML生成完成，继续构建过程...');
  process.exit(0);
}).catch(error => {
  console.error('生成失败:', error);
  process.exit(1);
});
