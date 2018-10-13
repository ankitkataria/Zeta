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
	mapping (address => PublicDoc) public publicShares;

	function _addPrivate(string _url, address _journalist) private {
		// the url coming has to be already encrypted
		PrivateDoc doc = PrivateDoc({
			url: _url,
			uploader: msg.sender
		});

		privateShares[_journalist].push(doc);
	}

	function _addPublic(string _url) private {
		PublicDoc doc = PublicDoc({
			url: _url,
			upvotes: 0,
			downvotes: 0,
			uploader: msg.sender
		});

		publicShares[uint(keccak256(_url))] = doc;
	}

	function _vote(uint _id, uint _change) private {
		publicShares[_id] += _change;
	}

	function addDocument(string _url, bool _isPublic, address _shareTo = address(0)) public {
		if(isPublic) 
			_addPublic(_url);
		else 
			_addPrivate(_url, _shareTo);
	}
}

