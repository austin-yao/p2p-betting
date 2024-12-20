# p2p-betting
EC2 front-end change commands:
npm run build (in frontend repo)
sudo rm -rf /var/www/html/dist
sudo mkdir -p /var/www/html
sudo mv /home/ec2-user/p2p-betting/frontend/dist /var/www/html