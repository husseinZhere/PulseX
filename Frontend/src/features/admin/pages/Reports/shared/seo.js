const upsertMeta = (selector, attrs) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    if (attrs.name) node.setAttribute("name", attrs.name);
    if (attrs.property) node.setAttribute("property", attrs.property);
    document.head.appendChild(node);
  }
  node.setAttribute("content", attrs.content);
};

export const applyReportsSeo = ({ title, description, keywords }) => {
  document.title = title;
  upsertMeta('meta[name="description"]', {
    name: "description",
    content: description,
  });
  upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: "index,follow",
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  upsertMeta('meta[property="og:type"]', {
    property: "og:type",
    content: "website",
  });
};
