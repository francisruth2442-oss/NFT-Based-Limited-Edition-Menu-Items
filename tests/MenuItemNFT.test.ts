import { describe, it, expect, beforeEach } from "vitest";
import { stringAsciiCV, uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_TOKEN_ID = 101;
const ERR_INVALID_METADATA = 102;
const ERR_INVALID_OWNER = 103;
const ERR_TRANSFER_PAUSED = 104;
const ERR_MINT_PAUSED = 105;
const ERR_MAX_SUPPLY_EXCEEDED = 110;
const ERR_INVALID_URI = 107;
const ERR_INVALID_ROYALTY_RATE = 108;
const ERR_INVALID_MAX_SUPPLY = 109;
const ERR_INVALID_UPDATE = 111;
const ERR_NO_METADATA = 112;
const ERR_INVALID_RECIPIENT = 113;
const ERR_INVALID_ADMIN = 114;
const ERR_CONTRACT_PAUSED = 115;
const ERR_INVALID_PARAM = 120;

interface Metadata {
  name: string;
  description: string;
  imageUri: string;
  perks: string;
  edition: number;
}

interface TokenUpdate {
  updateName: string;
  updateDescription: string;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

interface RoyaltyInfo {
  rate: number;
  recipient: string;
}

class MenuItemNFTMock {
  state: {
    nextTokenId: number;
    maxSupply: number;
    mintPaused: boolean;
    transferPaused: boolean;
    contractPaused: boolean;
    adminPrincipal: string;
    royaltyRate: number;
    royaltyRecipient: string;
    tokenMetadata: Map<number, Metadata>;
    tokenOwners: Map<number, string>;
    tokenUris: Map<number, string>;
    tokenUpdates: Map<number, TokenUpdate>;
  } = {
    nextTokenId: 1,
    maxSupply: 10000,
    mintPaused: true,
    transferPaused: false,
    contractPaused: false,
    adminPrincipal: "ST1ADMIN",
    royaltyRate: 5,
    royaltyRecipient: "ST1ADMIN",
    tokenMetadata: new Map(),
    tokenOwners: new Map(),
    tokenUris: new Map(),
    tokenUpdates: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1ADMIN";

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextTokenId: 1,
      maxSupply: 10000,
      mintPaused: true,
      transferPaused: false,
      contractPaused: false,
      adminPrincipal: "ST1ADMIN",
      royaltyRate: 5,
      royaltyRecipient: "ST1ADMIN",
      tokenMetadata: new Map(),
      tokenOwners: new Map(),
      tokenUris: new Map(),
      tokenUpdates: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1ADMIN";
  }

  getOwner(tokenId: number): Result<string | null> {
    return { ok: true, value: this.state.tokenOwners.get(tokenId) || null };
  }

  getLastTokenId(): Result<number> {
    return { ok: true, value: this.state.nextTokenId - 1 };
  }

  getTokenUri(tokenId: number): Result<string | null> {
    return { ok: true, value: this.state.tokenUris.get(tokenId) || null };
  }

  getMetadata(tokenId: number): Metadata | null {
    return this.state.tokenMetadata.get(tokenId) || null;
  }

  getTokenUpdate(tokenId: number): TokenUpdate | null {
    return this.state.tokenUpdates.get(tokenId) || null;
  }

  isOwner(tokenId: number, user: string): boolean {
    return this.state.tokenOwners.get(tokenId) === user;
  }

  getRoyaltyInfo(): RoyaltyInfo {
    return { rate: this.state.royaltyRate, recipient: this.state.royaltyRecipient };
  }

  setAdmin(newAdmin: string): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    if (newAdmin === this.caller) return { ok: false, value: ERR_INVALID_RECIPIENT };
    this.state.adminPrincipal = newAdmin;
    return { ok: true, value: true };
  }

  setRoyaltyRate(newRate: number): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    if (newRate > 10) return { ok: false, value: ERR_INVALID_ROYALTY_RATE };
    this.state.royaltyRate = newRate;
    return { ok: true, value: true };
  }

  setRoyaltyRecipient(newRecipient: string): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    if (newRecipient === this.caller) return { ok: false, value: ERR_INVALID_RECIPIENT };
    this.state.royaltyRecipient = newRecipient;
    return { ok: true, value: true };
  }

  setMaxSupply(newSupply: number): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    if (newSupply <= 0) return { ok: false, value: ERR_INVALID_MAX_SUPPLY };
    if (newSupply <= this.state.nextTokenId) return { ok: false, value: ERR_INVALID_PARAM };
    this.state.maxSupply = newSupply;
    return { ok: true, value: true };
  }

  pauseMint(paused: boolean): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    this.state.mintPaused = paused;
    return { ok: true, value: true };
  }

  pauseTransfer(paused: boolean): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    this.state.transferPaused = paused;
    return { ok: true, value: true };
  }

  pauseContract(paused: boolean): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    this.state.contractPaused = paused;
    return { ok: true, value: true };
  }

  mint(recipient: string, name: string, description: string, imageUri: string, perks: string, edition: number, uri: string): Result<number> {
    if (this.state.mintPaused) return { ok: false, value: ERR_MINT_PAUSED };
    if (this.state.contractPaused) return { ok: false, value: ERR_CONTRACT_PAUSED };
    const tokenId = this.state.nextTokenId;
    if (tokenId >= this.state.maxSupply) return { ok: false, value: ERR_MAX_SUPPLY_EXCEEDED };
    if (name.length === 0 || description.length === 0 || imageUri.length === 0 || perks.length === 0 || edition <= 0) return { ok: false, value: ERR_INVALID_METADATA };
    if (uri.length === 0) return { ok: false, value: ERR_INVALID_URI };
    this.state.tokenOwners.set(tokenId, recipient);
    this.state.tokenMetadata.set(tokenId, { name, description, imageUri, perks, edition });
    this.state.tokenUris.set(tokenId, uri);
    this.state.nextTokenId++;
    return { ok: true, value: tokenId };
  }

  transfer(tokenId: number, sender: string, recipient: string): Result<boolean> {
    if (this.state.transferPaused) return { ok: false, value: ERR_TRANSFER_PAUSED };
    if (this.state.contractPaused) return { ok: false, value: ERR_CONTRACT_PAUSED };
    if (this.caller !== sender) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (tokenId <= 0 || tokenId >= this.state.nextTokenId) return { ok: false, value: ERR_INVALID_TOKEN_ID };
    if (!this.isOwner(tokenId, sender)) return { ok: false, value: ERR_INVALID_OWNER };
    this.state.tokenOwners.set(tokenId, recipient);
    return { ok: true, value: true };
  }

  updateMetadata(tokenId: number, newName: string, newDescription: string): Result<boolean> {
    if (this.caller !== this.state.adminPrincipal) return { ok: false, value: ERR_INVALID_ADMIN };
    if (tokenId <= 0 || tokenId >= this.state.nextTokenId) return { ok: false, value: ERR_INVALID_TOKEN_ID };
    const metadata = this.getMetadata(tokenId);
    if (!metadata) return { ok: false, value: ERR_NO_METADATA };
    this.state.tokenMetadata.set(tokenId, { ...metadata, name: newName, description: newDescription });
    this.state.tokenUpdates.set(tokenId, { updateName: newName, updateDescription: newDescription, updateTimestamp: this.blockHeight, updater: this.caller });
    return { ok: true, value: true };
  }

  burn(tokenId: number, owner: string): Result<boolean> {
    if (this.state.contractPaused) return { ok: false, value: ERR_CONTRACT_PAUSED };
    if (this.caller !== owner) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (tokenId <= 0 || tokenId >= this.state.nextTokenId) return { ok: false, value: ERR_INVALID_TOKEN_ID };
    if (!this.isOwner(tokenId, owner)) return { ok: false, value: ERR_INVALID_OWNER };
    this.state.tokenOwners.delete(tokenId);
    this.state.tokenMetadata.delete(tokenId);
    this.state.tokenUris.delete(tokenId);
    this.state.tokenUpdates.delete(tokenId);
    return { ok: true, value: true };
  }
}

describe("MenuItemNFT", () => {
  let contract: MenuItemNFTMock;

  beforeEach(() => {
    contract = new MenuItemNFTMock();
    contract.reset();
  });

  it("mints an NFT successfully", () => {
    contract.pauseMint(false);
    const result = contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(1);
    const owner = contract.getOwner(1);
    expect(owner.value).toBe("ST1USER");
    const metadata = contract.getMetadata(1);
    expect(metadata?.name).toBe("Burger");
    const uri = contract.getTokenUri(1);
    expect(uri.value).toBe("uri.com");
  });

  it("rejects mint when paused", () => {
    const result = contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MINT_PAUSED);
  });

  it("rejects mint with invalid metadata", () => {
    contract.pauseMint(false);
    const result = contract.mint("ST1USER", "", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_METADATA);
  });

  it("transfers an NFT successfully", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    contract.caller = "ST1USER";
    const result = contract.transfer(1, "ST1USER", "ST2USER");
    expect(result.ok).toBe(true);
    const owner = contract.getOwner(1);
    expect(owner.value).toBe("ST2USER");
  });

  it("updates metadata successfully", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    const result = contract.updateMetadata(1, "NewBurger", "New Description");
    expect(result.ok).toBe(true);
    const metadata = contract.getMetadata(1);
    expect(metadata?.name).toBe("NewBurger");
    expect(metadata?.description).toBe("New Description");
    const update = contract.getTokenUpdate(1);
    expect(update?.updateName).toBe("NewBurger");
  });

  it("rejects metadata update by non-admin", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    contract.caller = "ST2FAKE";
    const result = contract.updateMetadata(1, "NewBurger", "New Description");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_ADMIN);
  });

  it("burns an NFT successfully", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    contract.caller = "ST1USER";
    const result = contract.burn(1, "ST1USER");
    expect(result.ok).toBe(true);
    const owner = contract.getOwner(1);
    expect(owner.value).toBe(null);
    const metadata = contract.getMetadata(1);
    expect(metadata).toBe(null);
  });
  
  it("sets royalty rate successfully", () => {
    const result = contract.setRoyaltyRate(7);
    expect(result.ok).toBe(true);
    const info = contract.getRoyaltyInfo();
    expect(info.rate).toBe(7);
  });

  it("rejects invalid royalty rate", () => {
    const result = contract.setRoyaltyRate(11);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_ROYALTY_RATE);
  });

  it("gets last token id correctly", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    const result = contract.getLastTokenId();
    expect(result.value).toBe(1);
  });

  it("checks owner correctly", () => {
    contract.pauseMint(false);
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    expect(contract.isOwner(1, "ST1USER")).toBe(true);
    expect(contract.isOwner(1, "ST2USER")).toBe(false);
  });

  it("parses metadata with Clarity types", () => {
    const name = stringAsciiCV("Burger");
    const edition = uintCV(1);
    expect(name.value).toBe("Burger");
    expect(edition.value).toEqual(BigInt(1));
  });

  it("rejects mint when max supply exceeded", () => {
    contract.pauseMint(false);
    contract.state.maxSupply = 1;
    contract.mint("ST1USER", "Burger", "Spicy Burger", "image.jpg", "10% off", 1, "uri.com");
    const result = contract.mint("ST2USER", "Pizza", "Cheese Pizza", "image2.jpg", "20% off", 2, "uri2.com");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_SUPPLY_EXCEEDED);
  });

  it("sets max supply successfully", () => {
    const result = contract.setMaxSupply(20000);
    expect(result.ok).toBe(true);
    expect(contract.state.maxSupply).toBe(20000);
  });

  it("rejects invalid max supply", () => {
    const result = contract.setMaxSupply(0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_MAX_SUPPLY);
  });
});