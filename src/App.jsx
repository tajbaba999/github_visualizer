import { useState } from "react";
import { GitBranch, GitCommit } from "lucide-react";

const GitHubRepoVisualizer = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState(""); // Track errors

  const extractRepoInfo = (url) => {
    const regex = /https:\/\/github.com\/([\w-]+)\/([\w-]+)/;
    const match = url.match(regex);
    if (match && match.length === 3) {
      return { owner: match[1], repo: match[2] };
    }
    return null;
  };

  const fetchRepoData = async (owner, repo) => {
    try {
      setLoading(true);
      setError("");

      // Fetch branches from GitHub API
      const branchesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches`
      );
      const branchesData = await branchesResponse.json();

      const branchesWithCommits = await Promise.all(
        branchesData.map(async (branch) => {
          // Fetch the last 5 commits for each branch
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=5`
          );
          const commitsData = await commitsResponse.json();
          return {
            name: branch.name,
            commits: commitsData.map((commit) => commit.commit.message),
          };
        })
      );

      setBranches(branchesWithCommits);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch repository data. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const repoInfo = extractRepoInfo(repoUrl);
    if (repoInfo) {
      setIsSubmitted(true);
      fetchRepoData(repoInfo.owner, repoInfo.repo);
    } else {
      setError("Invalid GitHub repository URL.");
    }
  };

  return (
    <div
      className={`min-h-screen bg-blue-100 ${
        !isSubmitted && "backdrop-blur-md"
      } flex items-center justify-center`}
    >
      <div className="container mx-auto px-4 py-8">
        {!isSubmitted ? (
          <div className="max-w-md mx-auto bg-white p-8 shadow-2xl rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              GitHub Repository Visualizer
            </h2>
            <label
              htmlFor="repo-url"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Provide the GitHub Repository Link
            </label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <GitBranch className="h-5 w-5" />
              </span>
              <input
                type="text"
                name="repo-url"
                id="repo-url"
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              Visualize Repository
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Repository: {repoUrl}
            </h2>
            {loading ? (
              <p>Loading branches and commits...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.name}
                  className="bg-white border rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-center mb-2">
                    <GitBranch className="mr-2 text-indigo-600" />
                    <span className="font-semibold text-lg">{branch.name}</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    {branch.commits.length > 0 ? (
                      branch.commits.map((commit, commitIndex) => (
                        <div key={commitIndex} className="flex items-center">
                          <GitCommit
                            className="mr-2 text-green-600"
                            size={16}
                          />
                          <span className="text-sm">{commit}</span>
                        </div>
                      ))
                    ) : (
                      <p>No commits found for this branch.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoVisualizer;
