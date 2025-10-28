export default function parseSocketCookies(cookieString: string): {
  name: string;
  sessionId: string;
} {
  console.log(`parseSocketCookies: parsing cookies: ${cookieString}`);

  const cookies: { [key: string]: string } = {};
  const cookiePairs = cookieString.split("; ");

  cookiePairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    cookies[key] = decodeURIComponent(value);
  });

  const name = cookies["name"];

  if (!name) {
    throw new Error("Missing 'name' cookie");
  }

  const sessionId = cookies["sessionId"] || "";

  return { name, sessionId };
}
