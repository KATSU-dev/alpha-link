ng build

Start-Service ssh-agent
ssh-add .\ssh\ssh_key

echo "  [ Sending Files... ]"
# Rename index file
# Rename-Item -Path ".\dist\llpc-001\index.html" -NewName "llpc.html"

$files = Get-ChildItem .\dist\alpha-link\                     # Get list of files
foreach($f in $files) {                                       # For each file in the dist folder
    if(!($f.FullName.Contains(".txt")) -and !($f.FullName.Contains("\assets")) -and !($f.FullName.Contains(".ico"))) {
        scp -r $f.FullName root@167.172.143.153:/var/www/html     # Copy file to server
    }
}

# Remove-Item ".\dist\llpc-001\llpc.html"
echo "  [ Files Sent ]"
echo " "

