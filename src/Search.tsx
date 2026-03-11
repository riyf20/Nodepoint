import { useEffect, useState } from "react";
import { Field } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import {
  addSearchQuery,
  checkSearchQuery,
  queryPosts,
  trendingSearchQuerys,
  updateSearchQuery,
} from "./services/appwriteServices";
import HomeCard from "./components/HomeCard";
import GradientText from "./components/reactbits/GradientText";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  const [searching, setSearching] = useState(false);

  const [searchResults, setSearchResults] = useState<Post[] | null>(null);

  const [trending, setTrending] = useState<string[]>([]);

  const recordSearchQuery = async () => {
    const normalized = searchQuery.trim().toLowerCase();

    if (normalized.length < 2) return;

    const response = await checkSearchQuery(normalized);

    if (response.documents.length > 0) {
      // update count
      let prevCount = response.documents[0].Count as number;
      await updateSearchQuery(normalized, prevCount + 1);
    } else {
      // create new document
      await addSearchQuery(normalized);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timeout = setTimeout(async () => {
      setSearching(true);
      setSearchResults([]);

      // fetch results
      const response = await queryPosts(searchQuery);

      const unfiltered = response.documents.map((item) => {
        const current = {
          $id: item.$id,
          Title: item.Title,
          Body: item.Body,
          Pictures: item.Pictures,
          Comments: item.Comments,
          Userid: item.Userid,
          Views: item.Views,
          Likes: item.Likes,
          Saves: item.Saves,
          $createdAt: item.$createdAt,
          $updatedAt: item.$updatedAt,
        } as Post;
        return current;
      });

      setSearchResults(unfiltered);

      await recordSearchQuery();

      setSearching(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchTrendingSearches = async () => {
    try {
      const response = await trendingSearchQuerys();

      let list: string[] = [];
      response.documents.map((item) => {
        list.push(item.$id);
      });

      setTrending(list);
    } catch (error: any) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  return (
    <div className="flex flex-row px-8 py-6">
      <div className=" w-full justify-center flex flex-row gap-6">
        <div className="flex-5/8">
          <p className="text-[#27B1FC] font-bold text-[24px]">
            Search for a post
          </p>

          <div className="border-4 border-[#27B1FC]/60 mt-4 p-4 flex flex-col rounded-2xl">
            <Field orientation="horizontal">
              <Input
                type="search"
                placeholder="Search..."
                id={`input-field-search`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </Field>

            {!searching && searchQuery && (
              <p className="my-2 ml-4">
                Showing results for "
                <span className="italic text-muted-foreground">
                  {searchQuery}
                </span>
                "{" "}
              </p>
            )}

            <div className=" flex flex-wrap gap-3 mt-4 py-4">
              {searching ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Card
                    key={index}
                    className="w-52 bg-[#171718] border-none shadow-2xl"
                  >
                    <CardHeader>
                      <Skeleton className=" h-40 w-full bg-[#1E1E20]" />
                    </CardHeader>
                    <CardContent className="flex flex-col -mt-2 -mb-3">
                      <Skeleton className="h-4 w-9/10 bg-[#1E1E20]" />
                      <Skeleton className="h-4 w-3/5 bg-[#1E1E20] mt-2" />
                    </CardContent>
                    <div className="flex px-5 flex-row pb-3">
                      <Skeleton className="w-6 h-6 rounded-full bg-[#1E1E20]" />
                      <Skeleton className="ml-auto h-6 w-3/5 bg-[#1E1E20]" />
                    </div>
                  </Card>
                ))
              ) : !searchQuery ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className=" bg-[#27B1FC]/40 p-6 rounded-xl text-center">
                    <p className="font-semibold text-lg">Start Searching</p>
                    <p className="text-[darkgray] text-sm mt-1">
                      Enter a keyword to find posts by title or content.
                    </p>
                  </div>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((item, index) => (
                  <HomeCard key={item.$id} post={item} delay={index * 0.1} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className=" bg-[#27B1FC]/40 p-6 rounded-xl text-center">
                    <p className="font-semibold text-lg">No results found</p>
                    <p className="text-[darkgray] text-sm mt-1">
                      Try another keyword.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ml-auto px-4">
          <p className="text-[#27B1FC] font-bold text-[24px]">
            Trending Searches
          </p>
          <div className="border-4 border-[#27B1FC]/60 mt-4 flex flex-col rounded-2xl">
            <div className="w-full h-full p-4 gap-4 flex flex-col">
              {trending.map((item, index) => (
                <div
                  className="w-full"
                  key={index.toString()}
                  onClick={() => {
                    setSearchQuery(item);
                  }}
                >
                  <GradientText
                    className="block w-full text-md px-2 py-1 transition-all duration-200 hover:scale-[1.2] "
                    colors={["#27B1FC", "#58C2FF", "#8B5CF6"]}
                  >
                    {item}
                  </GradientText>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
