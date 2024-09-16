import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { GitBranch } from "lucide-react";

const GitHubRepoVisualizer = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [repoData, setRepoData] = useState(null);
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

  const shortenDescription = (desc, maxLength = 20) => {
    return desc.length > maxLength
      ? desc.substring(0, maxLength - 3) + "..."
      : desc;
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

      const nodes = [];
      const links = [];

      // Add main branch
      nodes.push({ id: "main", group: 1, size: 20 });

      for (const branch of branchesData) {
        if (branch.name !== "main") {
          nodes.push({ id: branch.name, group: 2, size: 15 });
          links.push({ source: "main", target: branch.name });
        }

        const commitsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=5`
        );
        if (!commitsResponse.ok) throw new Error("Failed to fetch commits");
        const commitsData = await commitsResponse.json();

        commitsData.forEach((commit, index) => {
          const commitId = `${branch.name}-commit-${index}`;
          nodes.push({
            id: commitId,
            name: shortenDescription(commit.commit.message),
            author: commit.commit.author.name,
            group: 3,
            size: 10,
          });
          links.push({ source: branch.name, target: commitId });
        });
      }

      setRepoData({ nodes, links });
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
    if (isSubmitted && repoData) {
      createVisualization();
    }
  }, [isSubmitted, repoData]);

  const createVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const simulation = d3
      .forceSimulation(repoData.nodes)
      .force(
        "link",
        d3
          .forceLink(repoData.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(repoData.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .append("g")
      .selectAll("g")
      .data(repoData.nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    node
      .append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => color(d.group));

    node
      .append("title")
      .text((d) => (d.author ? `${d.name}\nAuthor: ${d.author}` : d.id));

    node
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text((d) => d.name || d.id)
      .style("font-size", (d) => `${Math.max(8, d.size / 2)}px`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
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
              <p>Loading repository data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <svg ref={svgRef} width="100%" height="800" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoVisualizer;
