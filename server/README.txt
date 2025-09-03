Access the Terminal in hPanel

Log in to Hostinger's hPanel.

Navigate to Advanced > SSH Access.

Make sure SSH is enabled.

Create a SSH key using a bash Terminal
And add the public key from C:\Users\tanvi\.ssh\id_rsa.pub to the SSH keys in Advanced > SSH Access of hPanel to access the terminal from local computer

ssh-keygen -t rsa -b 4096

ssh -p <port> <username>@<your-server-ip>

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install node

chmod -R 755 public_html/api


.htaccess

RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

