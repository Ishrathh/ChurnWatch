# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing of the ChurnWatch project.

## Workflows

### Server Tests (`server-tests.yml`)

This workflow runs the Python tests for the server component whenever changes are made to the server code or the workflow itself.

- Triggered on any push or pull request that affects the `server/` directory
- Tests against Python 3.9, 3.10, and 3.11
- Uses pytest to run the tests

### App Tests (`app-tests.yml`)

This workflow runs the JavaScript/TypeScript tests for the app component whenever changes are made to the app code or the workflow itself.

- Triggered on any push or pull request that affects the `app/` directory
- Tests against Node.js 18.x and 20.x
- Uses Jest to run the tests

## How to Use

These workflows run automatically when you push changes to any branch in the repository or create a pull request. You can view the results in the "Actions" tab of your GitHub repository.

The workflows will only run when changes are made to their respective directories or workflow files. This means:
- Changes to `server/**` will trigger server tests
- Changes to `app/**` will trigger app tests

To manually trigger a workflow, you can:

1. Go to the "Actions" tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow" and select the branch
