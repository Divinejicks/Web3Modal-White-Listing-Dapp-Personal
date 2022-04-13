const hre = require("hardhat");

const main = async () => {
    const WhiteList = await hre.ethers.getContractFactory("WhiteList");
    const whiteList = await WhiteList.deploy(2);
    await whiteList.deployed();
    
    console.log("White list deployed to: ", whiteList.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1)
    })