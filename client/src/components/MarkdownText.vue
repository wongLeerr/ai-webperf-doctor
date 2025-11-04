<template>
  <div class="markdown-content" v-html="formattedText"></div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

// 改进的 Markdown 解析函数
const formattedText = computed(() => {
  if (!props.text) return "";

  let text = props.text;

  // 按行分割处理
  const lines = text.split("\n");
  const processedLines = [];
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 处理标题
    if (trimmed.startsWith("### ")) {
      if (inList) {
        processedLines.push(wrapList(listItems));
        listItems = [];
        inList = false;
      }
      const titleText = escapeHtml(trimmed.substring(4));
      processedLines.push(
        `<h3 class="text-lg font-bold mt-6 mb-3 text-gray-900">${titleText}</h3>`
      );
      continue;
    } else if (trimmed.startsWith("## ")) {
      if (inList) {
        processedLines.push(wrapList(listItems));
        listItems = [];
        inList = false;
      }
      const titleText = escapeHtml(trimmed.substring(3));
      processedLines.push(
        `<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">${titleText}</h2>`
      );
      continue;
    } else if (trimmed.startsWith("# ")) {
      if (inList) {
        processedLines.push(wrapList(listItems));
        listItems = [];
        inList = false;
      }
      const titleText = escapeHtml(trimmed.substring(2));
      processedLines.push(
        `<h1 class="text-2xl font-bold mt-6 mb-3 text-gray-900">${titleText}</h1>`
      );
      continue;
    }

    // 处理列表项（- 或 * 开头）
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        inList = true;
      }
      listItems.push(listMatch[1]);
      continue;
    }

    // 处理有序列表（数字. 开头）
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (inList) {
        processedLines.push(wrapList(listItems));
        listItems = [];
        inList = false;
      }
      const itemText = escapeHtml(orderedMatch[1]);
      processedLines.push(
        `<ol class="list-decimal list-inside space-y-1 my-3 ml-4"><li class="mb-1.5">${itemText}</li></ol>`
      );
      continue;
    }

    // 如果不是列表项，结束当前列表
    if (inList) {
      processedLines.push(wrapList(listItems));
      listItems = [];
      inList = false;
    }

    // 处理空行
    if (trimmed === "") {
      processedLines.push("<br>");
      continue;
    }

    // 普通文本行（标记为需要处理）
    processedLines.push({ type: "text", content: line });
  }

  // 处理剩余的列表项
  if (inList && listItems.length > 0) {
    processedLines.push(wrapList(listItems));
  }

  // 处理文本行：转义 HTML 并应用格式
  const processedHtml = processedLines
    .map((item) => {
      if (typeof item === "string") {
        // 已经是 HTML（标题、列表等）
        return item;
      } else if (item.type === "text") {
        // 普通文本行：先转义，再应用格式
        let text = item.content;

        // 转义 HTML 特殊字符
        text = escapeHtml(text);

        // 处理加粗（**文本** 或 __文本__）
        text = text.replace(
          /\*\*([^*]+?)\*\*/g,
          '<strong class="font-bold text-gray-900">$1</strong>'
        );
        text = text.replace(
          /__([^_]+?)__/g,
          '<strong class="font-bold text-gray-900">$1</strong>'
        );

        // 处理行内代码（`代码`）
        text = text.replace(
          /`([^`]+?)`/g,
          '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
        );

        // 处理高亮（==文本==）
        text = text.replace(
          /==([^=]+?)==/g,
          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
        );

        return text;
      }
      return "";
    })
    .join("\n");

  // 处理换行（\n 转换为 <br>）
  let html = processedHtml.replace(/\n/g, "<br>");

  // 处理段落（连续的 <br> 转换为段落分隔）
  html = html.replace(/(<br>\s*)+/g, '</p><p class="mb-3">');

  // 包裹内容
  if (
    !html.startsWith("<h") &&
    !html.startsWith("<ul") &&
    !html.startsWith("<ol")
  ) {
    html = `<p class="mb-3">${html}</p>`;
  }

  // 清理多余的段落标签
  html = html.replace(/<p class="mb-3"><\/p>/g, "");
  html = html.replace(/<\/p><p class="mb-3">$/g, "</p>");

  return html;
});

// 辅助函数：转义 HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 辅助函数：包裹列表
function wrapList(items) {
  if (items.length === 0) return "";
  const listItems = items
    .map((item) => {
      // 转义列表项内容
      let escaped = escapeHtml(item);
      // 应用格式（加粗、代码等）
      escaped = escaped.replace(
        /\*\*([^*]+?)\*\*/g,
        '<strong class="font-bold text-gray-900">$1</strong>'
      );
      escaped = escaped.replace(
        /__([^_]+?)__/g,
        '<strong class="font-bold text-gray-900">$1</strong>'
      );
      escaped = escaped.replace(
        /`([^`]+?)`/g,
        '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
      );
      escaped = escaped.replace(
        /==([^=]+?)==/g,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      );
      return `<li class="mb-1.5">${escaped}</li>`;
    })
    .join("");
  return `<ul class="list-disc list-inside space-y-1 my-3 ml-4">${listItems}</ul>`;
}
</script>

<style scoped>
.markdown-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  color: #111827;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
}

.markdown-content :deep(pre) {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(mark) {
  background-color: #fef08a;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
</style>
