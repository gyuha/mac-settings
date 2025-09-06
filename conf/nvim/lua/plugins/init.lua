-- lua/plugins/init.lua
return {
	-- 테마
	{
		"folke/tokyonight.nvim",
		lazy = false,
		priority = 1000,
		config = function()
			vim.cmd.colorscheme("tokyonight")
		end
	},

	-- 상태바
	{
		"nvim-lualine/lualine.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		config = function()
			require("lualine").setup({ options = { theme = "tokyonight", globalstatus = true } })
		end
	},

	-- which-key: 키바인드 힌트
	{
		"folke/which-key.nvim",
		event = "VeryLazy",
		config = function() require("which-key").setup({}) end
	},

	-- 파일 탐색기
	{
		"nvim-tree/nvim-tree.lua",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		cmd = { "NvimTreeToggle", "NvimTreeFindFile" },
		keys = {
			{ "<leader>e", "<cmd>NvimTreeToggle<cr>", desc = "Explorer" },
			{ "<F3>", "<cmd>NvimTreeToggle<cr>", desc = "Explorer (F3)" }, -- 추가
		},
		config = function()
			require("nvim-tree").setup({
				view = { width = 32 },
				filters = { dotfiles = false },
				git = { enable = true, ignore = false },
			})
		end
	},

	-- telescope: 퍼지 검색
	{
		"nvim-telescope/telescope.nvim",
		branch = "0.1.x",
		dependencies = { "nvim-lua/plenary.nvim", "nvim-tree/nvim-web-devicons" },
		cmd = "Telescope",
		keys = {
			{ "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find Files" },
			{ "<leader>fg", "<cmd>Telescope live_grep<cr>",  desc = "Live Grep" },
			{ "<leader>fb", "<cmd>Telescope buffers<cr>",    desc = "Buffers" },
			{ "<leader>fh", "<cmd>Telescope help_tags<cr>",  desc = "Help" },
		},
		config = function()
			require("telescope").setup({
				defaults = {
					layout_strategy = "flex",
					mappings = {
						i = { ["<C-j>"] = "move_selection_next", ["<C-k>"] = "move_selection_previous" }
					}
				}
			})
		end
	},

	-- Treesitter
	{
		"nvim-treesitter/nvim-treesitter",
		build = ":TSUpdate",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("nvim-treesitter.configs").setup({
				ensure_installed = { "bash", "lua", "vim", "vimdoc", "json", "yaml", "toml", "markdown",
					"regex",
					"javascript", "typescript", "tsx", "html", "css", "python", "go", "rust", "cpp" },
				highlight = { enable = true },
				indent = { enable = true },
				incremental_selection = { enable = true },
			})
		end
	},


	-- 자동완성
	{
		"hrsh7th/nvim-cmp",
		event = "InsertEnter",
		dependencies = {
			"L3MON4D3/LuaSnip",
			"saadparwaiz1/cmp_luasnip",
			"hrsh7th/cmp-nvim-lsp",
			"hrsh7th/cmp-buffer",
			"hrsh7th/cmp-path",
			"rafamadriz/friendly-snippets",
		},
		config = function()
			local cmp = require("cmp")
			local luasnip = require("luasnip")
			require("luasnip.loaders.from_vscode").lazy_load()

			cmp.setup({
				snippet = {
					expand = function(args) luasnip.lsp_expand(args.body) end,
				},
				mapping = cmp.mapping.preset.insert({
					["<C-b>"] = cmp.mapping.scroll_docs(-4),
					["<C-f>"] = cmp.mapping.scroll_docs(4),
					["<C-Space>"] = cmp.mapping.complete(),
					["<CR>"] = cmp.mapping.confirm({ select = true }),
					["<Tab>"] = cmp.mapping(function(fallback)
						if cmp.visible() then
							cmp.select_next_item()
						elseif luasnip.expand_or_locally_jumpable() then
							luasnip.expand_or_jump()
						else
							fallback()
						end
					end, { "i", "s" }),
					["<S-Tab>"] = cmp.mapping(function(fallback)
						if cmp.visible() then
							cmp.select_prev_item()
						elseif luasnip.locally_jumpable(-1) then
							luasnip.jump(-1)
						else
							fallback()
						end
					end, { "i", "s" }),
				}),
				sources = cmp.config.sources({
					{ name = "nvim_lsp" },
					{ name = "luasnip" },
					{ name = "path" },
				}, { { name = "buffer" } }),
			})
		end
	},


	-- 코멘트 토글
	{
		"numToStr/Comment.nvim",
		keys = {
			{ "gc", mode = { "n", "v" }, desc = "Toggle Comment" },
			{ "gb", mode = { "n", "v" }, desc = "Block Comment" },
		},
		config = function() require("Comment").setup() end
	},

	-- surround 편집
	{
		"kylechui/nvim-surround",
		event = "VeryLazy",
		config = function() require("nvim-surround").setup() end
	},

	-- 점프/모션
	{
		"folke/flash.nvim",
		event = "VeryLazy",
		opts = { modes = { search = { enabled = true } } },
		keys = {
			{ "s", mode = { "n", "x", "o" }, function() require("flash").jump() end,       desc = "Flash" },
			{ "S", mode = { "n", "o", "x" }, function() require("flash").treesitter() end, desc = "Flash TS" },
			{ "r", function() require("flash").remote() end,     mode = "o",               desc = "Flash Remote" },
			{ "R", function() require("flash").treesitter_search() end, mode = { "n", "x", "o" }, desc = "Flash TS Search" },
		}
	},

	-- Git
	{
		"lewis6991/gitsigns.nvim",
		event = { "BufReadPre", "BufNewFile" },
		config = function()
			require("gitsigns").setup({
				signs = { add = { text = "+" }, change = { text = "~" }, delete = { text = "_" } },
				current_line_blame = true,
			})
		end
	},
	-- { "tpope/vim-fugitive", cmd = { "Git", "Gdiffsplit", "Gblame" } },

	-- 알림/메시지 UI
	{ "rcarriga/nvim-notify", config = function() vim.notify = require("notify") end },
	{
		"folke/noice.nvim",
		event = "VeryLazy",
		dependencies = { "MunifTanjim/nui.nvim", "rcarriga/nvim-notify" },
		opts = { presets = { lsp_doc_border = true } }
	},

	-- 문제/리스트 UI
	{
		"folke/trouble.nvim",
		cmd = "Trouble",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = {},
		keys = {
			{ "<leader>xx", "<cmd>Trouble diagnostics toggle<cr>", desc = "Diagnostics (Trouble)" },
		}
	},


	-- todo comments
	{
		"folke/todo-comments.nvim",
		event = "VeryLazy",
		dependencies = { "nvim-lua/plenary.nvim" },
		config = function() require("todo-comments").setup() end
	},

}
