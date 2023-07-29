/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

// Deterministic JSON.stringify()
// const stringify = require("json-stringify-deterministic");
// const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class FirstCustomContract extends Contract {
  async CreateContact(ctx, name, status, phoneNumber) {
    const address = ctx.clientIdentity.getID();
    let contacts = await ctx.stub.getState(address);

    if (!contacts || contacts.length === 0) {
      contacts = {};
    } else {
      contacts = JSON.parse(contacts.toString("utf-8"));
    }

    contacts[name] = { status, phoneNumber };

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(contacts)));

    contacts = await ctx.stub.getState(address);

    return contacts;
  }

  async ReadAContact(ctx, name) {
    const address = ctx.clientIdentity.getID();
    let contactsBuffer = await ctx.stub.getState(address);

    if (!contactsBuffer || contactsBuffer.length === 0) {
      throw new Error("Haven't registered any contact yet");
    }

    const contacts = JSON.parse(contactsBuffer.toString("utf-8"));

    if (name) {
      return { [name]: contacts[name] || {} };
    } else {
      return contacts;
    }
  }

  async ReadAllContact(ctx) {
    const address = ctx.clientIdentity.getID();
    let contactsBuffer = await ctx.stub.getState(address);

    if (!contactsBuffer || contactsBuffer.length === 0) {
      return {};
    }

    const contacts = JSON.parse(contactsBuffer.toString("utf-8"));
    return contacts;
  }

  async updateAContact(ctx, name, key, value) {
    const address = ctx.clientIdentity.getID();

    let contacts = await ctx.stub.getState(address);

    if (!contacts || contacts.length === 0) {
      throw new Error("Haven't registered any contact yet");
    }

    contacts = JSON.parse(contacts.toString("utf-8"));

    if (!contacts[name]) {
      throw new Error(`No contact found to update with name ${name}`);
    }

    contacts[name][key] = value;

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(contacts)));
    return { [name]: contacts[name] };
  }

  async deleteAContact(ctx, name) {
    const address = ctx.clientIdentity.getID();
    let contacts = await ctx.stub.getState(address);
    if (!contacts || contacts.length === 0) {
      throw new Error("Haven't registered any contact yet");
    }
    contacts = JSON.parse(contacts.toString("utf-8"));
    delete contacts[name];
    await ctx.stub.putState(address, Buffer.from(JSON.stringify(contacts)));
    return "Deleted a contact successfully";
  }

  async deleteAllContact(ctx) {
    const address = ctx.clientIdentity.getID();
    await ctx.stub.deleteState(address);
    return "Deleted All contacts successfully";
  }
}

module.exports = FirstCustomContract;
