import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

const GitHubRepoVisualizer = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const svgRef = useRef(null);

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

      const branchesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches`
      );
      if (!branchesResponse.ok) throw new Error("Failed to fetch branches");
      const branchesData = await branchesResponse.json();

      const branchesWithCommits = await Promise.all(
        branchesData.map(async (branch) => {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=5`
          );
          if (!commitsResponse.ok) throw new Error("Failed to fetch commits");
          const commitsData = await commitsResponse.json();
          return {
            name: branch.name,
            commits: commitsData.map((commit) => commit.commit.message),
          };
        })
      );

      setBranches(branchesWithCommits);
    } catch (err) {
      setError(
        err.message || "Failed to fetch repository data. Please check the URL."
      );
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

  useEffect(() => {
    if (isSubmitted && branches.length > 0) {
      createVisualization();
    }
  }, [isSubmitted, branches]);

  const createVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ]);

    // Create a hierarchical structure
    const root = d3
      .stratify()
      .id((d) => d.name)
      .parentId((d) => (d.name === "main" ? null : "main"))(branches);

    const treeData = tree(root);

    // Add links between the nodes

    // Add nodes
    const node = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr(
        "class",
        (d) => "node" + (d.children ? " node--internal" : " node--leaf")
      )
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Add circles for the nodes
    node
      .append("circle")
      .attr("r", 10)
      .style("fill", (d) => (d.data.name === "main" ? "#fd8d3c" : "#56b4e9"));

    // Add labels for the nodes
    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.children ? -13 : 13))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name);
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
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
              <svg ref={svgRef} width="100%" height="600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoVisualizer;
