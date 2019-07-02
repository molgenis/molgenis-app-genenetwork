# Setup genenetwork on CentOS 6.9
VM setup on CentOS 6.9.

## Install NodeJS
We need to install nodejs and npm to run this application on CentOS.

```bash
yum install nodejs
npm install n
npm n stable
```

## Install the right version of GCLIB
> http://luiarthur.github.io/gccinstall

Download the right gcc version from the internet.

```bash
cd /opt
wget http://www.netgull.com/gcc/releases/gcc-5.2.0/gcc-5.2.0.tar.gz
tar -xvf gcc-5.2.0.tar.gz
ln -s gcc-5.2.0 gcc
```

Create a directory to run make and make install to compile gcc module

```bash
cd /opt
mkdir objdir
$PWD/../gcc/configure --prefix=/opt/gcc --enable-languages=c,c++,fortran,go --disable-multilib
# note this takes several hours
nohup make &
nohup make install &
```

Add the following content to the root-profile and molgenis profile:
- ```vi /root/.bashrc```
- ```vi /srv/molgenis/.bashrc```

```bash
export PATH=/opt/gcc/bin:$PATH
export LD_LIBRARY_PATH=/opt/gcc/lib:$LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/opt/gcc/lib64:$LD_LIBRARY_PATH
```

## Packaging
> TODO:
>
>- Need to release this project with ```npm version``` in new release train (https://jenkins.dev.molgenis.org)
>- Need to have a Docker image to roil out on new kubernetes cluster
>- Upgrade elasticsearch to at least 5.5.1
>- Create helm-chart for kubernetes cluster 
