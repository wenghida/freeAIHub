const https = require("https");

// 文生文模型列表
const models = ["qwen-coder", "roblox-rp", "bidara", "elixposearch"];

// 测试文本
const testText =
  "Hello, this is a test message for checking model availability.";

// 失败模型列表
let failedModels = [];

// 调用API的函数
async function callTextToTextAPI(model) {
  return new Promise((resolve) => {
    const prompt = `Please process the following text: ${testText}`;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}?model=${model}&max_tokens=100`;

    const options = {
      method: "GET",
      headers: {
        Accept: "text/plain",
      },
    };

    const req = https.get(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${model}: Success`);
          resolve({ model, success: true });
        } else {
          console.log(`❌ ${model}: Failed (Status: ${res.statusCode})`);
          failedModels.push({ model, status: res.statusCode });
          resolve({ model, success: false, status: res.statusCode });
        }
      });
    });

    req.on("error", (error) => {
      console.log(`❌ ${model}: Failed (Error: ${error.message})`);
      failedModels.push({ model, error: error.message });
      resolve({ model, success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ ${model}: Failed (Timeout)`);
      failedModels.push({ model, error: "Timeout" });
      resolve({ model, success: false, error: "Timeout" });
    });
  });
}

// 主函数
async function main() {
  console.log("开始测试文生文模型调用...\n");

  for (const model of models) {
    try {
      await callTextToTextAPI(model);
      // 等待5秒再进行下一个测试
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.log(`❌ ${model}: Failed (Error: ${error.message})`);
      failedModels.push({ model, error: error.message });
    }
  }

  console.log("\n测试完成!");
  if (failedModels.length > 0) {
    console.log("\n失败的模型列表:");
    failedModels.forEach((item) => {
      console.log(`- ${item.model}: ${item.error || `Status ${item.status}`}`);
    });
  } else {
    console.log("\n所有模型调用成功!");
  }
}

// 运行主函数
main();
