pragma solidity ^0.4.17;

contract Files {
	struct PublicDoc {
		string url;
		uint upvotes;
		uint downvotes;
		address uploader;
	}

	struct PrivateDoc {
		string url; // will be encrypted 
		address uploader;
	}

	// mapping from the address of the receiver of the files
	// to the Private Docs
	mapping (address => PrivateDoc[]) public privateShares;

	// mapping from an id to describe a file to its meta deta
	mapping (uint => PublicDoc) public publicShares;

	PublicDoc[] public publicSharesList;

	function getVotes(uint _id) view public returns (uint a, uint b) {
		return (publicShares[_id].upvotes, publicShares[_id].downvotes);
	}

	function _addPrivate(string _url, address _journalist) private {
		// the url coming has to be already encrypted
		privateShares[_journalist].push(PrivateDoc({
			url: _url,
			uploader: msg.sender
		}));
	}

	function _addPublic(string _url) private {
		publicShares[uint(keccak256(abi.encodePacked(_url)))] = PublicDoc({
			url: _url,
			upvotes: 0,
			downvotes: 0,
			uploader: msg.sender
		});

		publicSharesList.push(PublicDoc({
			url: _url,
			upvotes: 0,
			downvotes: 0,
			uploader: msg.sender
		}));
	}

	function vote(uint _id, int _change) public {
		if(_change == 1)
			publicShares[_id].upvotes += 1;
		else 
			publicShares[_id].downvotes +=1;
	}

	function addPublicDocument(string _url) public {
		_addPublic(_url);
	}

	function addDocument(string _url, address _shareTo) public {
		_addPrivate(_url, _shareTo);
	}

	function getPublicSharesListCount() public view returns(uint){
		return publicSharesList.length;
	}

	function getPublicShareInfo(uint index) public view returns (uint, string, uint, uint) {
		return (index, publicSharesList[index].url, publicSharesList[index].upvotes, publicSharesList[index].downvotes);
	}

	function getPrivateSharesCount(address j) public view returns (uint) {
		return privateShares[j].length;
	}

	function getPrivateSharesInfo(address j, uint i) public view returns (string, address) {
		return (privateShares[j][i].url, privateShares[j][i].address);
	}
}

