import { createHash } from "crypto";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

// 抽選ブロック
const LOTTERY_BLOCK = ~~process.env.LOTTERY_BLOCK!;
const ADD_EPOCH = ~~(process.env.ADD_EPOCH || 0)

async function main() {
  const environment = await ethers.getContractAt(
    "IEnvironment",
    "0x0000000000000000000000000000000000001000"
  );
  const stakeManager = await ethers.getContractAt(
    "IStakeManager",
    "0x0000000000000000000000000000000000001001"
  );
  const oasyx = await ethers.getContractAt(
    "IERC721",
    "0x4688e596Fb8ffAa9F7c1f02985B44651CF642123"
  );
  const overrides = { blockTag: LOTTERY_BLOCK }

  // ステーキングコントラクトからバリデータ毎のステーク量を取得
  const epoch = (await environment.epoch(overrides)).toNumber() + ADD_EPOCH;
  const cursol = 0;
  const howMany = 999;
  const { stakes } = await stakeManager.getValidators(epoch, cursol, howMany, overrides);

  // ステーク量を合計
  const total = stakes.reduce(
    (acc: BigNumber, x: BigNumber) => acc.add(x),
    BigNumber.from(0)
  );

  // 単位をEtherに変換して小数点以下を切り捨て
  const stake = ethers.utils.formatEther(total).split(".")[0];

  // SHA256ハッシュ化
  const hasher = createHash("sha256");
  hasher.update(stake);
  const digest = hasher.digest("hex");

  // 10進数化
  const decimal = BigNumber.from("0x" + digest).toString();

  // 下4桁を取得
  const tokenId = decimal.slice(-4);

  // 当選者を取得
  const winner = await oasyx.ownerOf(tokenId)

  const output = [
    `epoch   : ${epoch}`,
    `stake   : ${stake}`,
    `sha256  : ${digest}`,
    `decimal : ${decimal}`,
    `tokenId : ${tokenId}`,
    `winner  : ${winner}`,
  ].join("\n");

  console.log(output);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
