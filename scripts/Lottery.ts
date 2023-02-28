import { createHash } from "crypto";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

// 抽選ブロック
const LOTTERY_BLOCK = ~~process.env.LOTTERY_BLOCK!;

async function main() {
  const stakeManager = await ethers.getContractAt(
    "IStakeManager",
    "0x0000000000000000000000000000000000001001"
  );

  // ステーキングコントラクトからバリデータ毎のステーク量を取得
  const epoch = 0;
  const cursol = 0;
  const howMany = 999;
  const { stakes } = await stakeManager.getValidators(epoch, cursol, howMany, {
    blockTag: LOTTERY_BLOCK,
  });

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
  const winner = decimal.slice(-4);

  const output = [
    `stake   : ${stake}`,
    `sha256  : ${digest}`,
    `decimal : ${decimal}`,
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