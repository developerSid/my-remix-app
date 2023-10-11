import type { MetaFunction } from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, useLoaderData, useFetcher } from "@remix-run/react";
import { Suspense } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

enum JokeType {
  single = "single",
  twopart = "twopart",
}

type SingleJoke = {
  type: JokeType.single;
  joke: string;
};

type TwopartJoke = {
  type: JokeType.twopart;
  setup: string;
  delivery: string;
};

type JokeResponse = SingleJoke | TwopartJoke;

const getJoke = async () => {
  const response = await fetch(
    "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit"
  );
  if (!response.ok) throw new Error(response.statusText);
  return await (response.json() as Promise<JokeResponse>);
};

export const loader = async () => {
  const jokePromise = getJoke();
  return defer({ jokeData: jokePromise });
};
export const action = async () => null;

export default function Index() {
  const { jokeData } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const resolveJoke = (data: JokeResponse) =>
    data.type == JokeType.single ? (
      <h3>{data.joke}</h3>
    ) : (
      <>
        <h3>{data.setup}..</h3>
        <h3>{data.delivery}</h3>
      </>
    );

  return (
    <div className="container mx-auto rounded shadow-lg outline outline-1 outline-gray-100 m-5">
      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold mb-2">Get-A-Joke</h1>
        <Suspense fallback={<h3>Loading...</h3>}>
          <Await resolve={jokeData}>{resolveJoke}</Await>
        </Suspense>
        <div className="my-2">
          <fetcher.Form method="post">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Another One Please
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
