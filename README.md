# GitHub Visualizer

GitHub Visualizer is a tool where users can input the link to their GitHub repository and visualize how the branches and commits are interrelated. It provides a graphical representation of a GitHub repository, showing the relationships between different parts of the project and giving insights into its history.

## Features

- **Branch Visualization:** Displays all branches of the repository in a clear and intuitive graph.
- **Commit History:** Shows the commits made on each branch and how they are connected.
- **Interactive UI:** Users can explore branches and commits through an easy-to-navigate user interface.
- **Git Relationships:** Highlights the relationships between branches and merges.

## How It Works

1. Users enter the link to a GitHub repository.
2. The visualizer fetches the branch and commit data from GitHub.
3. A graphical representation of the repository is displayed, with clear indications of branches, commits, and merges.

## Installation

Follow these steps to install and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/tajbaba999/github_visualizer.git
   ```

2. Navigate to the project directory:
   ```bash
   cd github_visualizer
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Run the application:
   ```bash
   npm start
   ```

5. Open your browser and navigate to ```http://localhost:3000``` to use the visualizer.

## Usage

1. Once the application is running, input the URL of a GitHub repository in the input field.
2. Click on the "Visualize" button.
3. Explore the graph displaying branches and commits of the repository.

## Screenshots

*(Add your screenshots here)*

## Technologies Used

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **API:** GitHub REST API

