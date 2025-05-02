# Installing Node.js and npm on a Virtual Machine

This guide provides multiple methods to install Node.js and npm on your VM, which you'll need before deploying the QuantHive website.

## Method 1: Using Package Manager (Recommended for Ubuntu/Debian)

This is the simplest method but may not provide the latest Node.js version:

```bash
# Update the package repository
sudo apt update

# Install Node.js and npm
sudo apt install -y nodejs npm

# Verify the installation
node -v
npm -v
```

## Method 2: Using NVM (Node Version Manager - More Flexible)

NVM allows you to install and manage multiple Node.js versions:

```bash
# Install prerequisites
sudo apt update
sudo apt install -y curl

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Activate NVM (or restart your terminal)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install the latest LTS version of Node.js
nvm install --lts

# Verify the installation
node -v
npm -v
```

## Method 3: Using NodeSource Repository (For Specific Versions)

This method provides more recent and specific versions of Node.js:

```bash
# Import the NodeSource GPG key
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Create deb repository (for Node.js 20.x, change as needed)
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Update and install
sudo apt update
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

## For Red Hat / CentOS / Fedora Systems

```bash
# Install Node.js and npm
sudo dnf install -y nodejs npm

# Verify installation
node -v
npm -v
```

## After Installation

After successfully installing Node.js and npm, you can continue with the QuantHive website deployment as described in the main deployment instructions. Make sure you have:

1. Installed other required dependencies (PM2, etc.)
2. Transferred your website files to the server
3. Set up proper environment variables
4. Configured a web server (like Nginx) as needed

For a full deployment walkthrough, refer to the `deployment-instructions.md` file. 