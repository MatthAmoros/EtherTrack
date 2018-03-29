function leftPad(str, len, pad)
{
	var newLen = len - str.length;
	var padding;
	for(let i = 0; i < newLen; i++) { padding = padding + pad;}
	let padded = (padding+str).slice(len * -1);

	return padded;
}

function keccak256(str)
{
	let hashed = web3.sha3(leftPad(str, 64, 0), { encoding: 'hex' });
	return hashed;
}
