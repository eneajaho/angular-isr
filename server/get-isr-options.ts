const isrScriptTag = '<script id="isr-state" type="application/json">';

export function getISROptions(html: string): {
  revalidate: number | null;
} {
  if (!html && !html?.includes(isrScriptTag)) {
    return { revalidate: null };
  }

  const index = html.indexOf(isrScriptTag);

  const isrScript = html.substring(index); // start from script till the end
  const indexOfCloseScriptTag = isrScript.indexOf("</script>"); // starts from where it begins

  if (index === -1) {
    return { revalidate: null };
  }

  const val = isrScript
    .substring(0, indexOfCloseScriptTag) // remove close script tag
    .replace(isrScriptTag, "") // remove start script tag

  return JSON.parse(val);
}
