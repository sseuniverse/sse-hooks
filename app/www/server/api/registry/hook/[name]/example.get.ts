export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Hook name is required",
    });
  }

  const urlTsx = `https://raw.githubusercontent.com/sseuniverse/sse-hooks/main/examples/${name}.tsx`;
  const urlJsx = `https://raw.githubusercontent.com/sseuniverse/sse-hooks/main/examples/${name}.js`;

  try {
    const [responseTsx, responseJsx] = await Promise.all([
      fetch(urlTsx),
      fetch(urlJsx),
    ]);

    if (!responseTsx.ok && !responseJsx.ok) {
      throw createError({
        statusCode: 404,
        statusMessage: "Example not found",
      });
    }

    let tsxSource = "";
    if (responseTsx.ok) {
      tsxSource = await responseTsx.text();
    } else {
      tsxSource = "// TypeScript example is not available right now.";
    }

    let jsxSource = "";
    if (responseJsx.ok) {
      jsxSource = await responseJsx.text();
    } else {
      jsxSource = "// JavaScript example is not available right now.";
    }

    return {
      ts: tsxSource,
      js: jsxSource,
    };
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch the example source code",
    });
  }
});
